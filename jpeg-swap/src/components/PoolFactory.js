import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styled from "styled-components";
import FactoryABI from "../contracts/SwapPoolFactoryABI.json";
import config from "../../public/config/config.json";

const Card = styled.div`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  padding: 25px;
  margin: 20px 0;
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h3`
  color: white;
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin: 15px 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  align-items: center;
  margin: 10px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
    border-color: white;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
`;

const CreateButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  width: 100%;
  margin-top: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin: 15px 0;
  font-size: 14px;
`;

const ExistingPoolsSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
`;

const PoolItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PoolFactory = ({ provider, account }) => {
  const [formData, setFormData] = useState({
    nftCollection: '',
    receiptContract: config.STAKE_RECEIPT_ADDRESS,
    stonerPool: config.STONER_POOL_ADDRESS,
    swapFeeInWei: ethers.parseEther('0.001').toString(),
    stonerShare: '10'
  });
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [existingPools, setExistingPools] = useState([]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!provider || !account) return;

      try {
        const factory = new ethers.Contract(config.FACTORY_ADDRESS, FactoryABI, provider);
        const owner = await factory.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());

        // Load existing pools
        const pools = await factory.getAllPools();
        const poolsWithCollection = [];
        
        for (const poolAddr of pools) {
          try {
            // Get pool details
            const poolContract = new ethers.Contract(poolAddr, [
              "function nftCollection() view returns (address)"
            ], provider);
            const collection = await poolContract.nftCollection();
            poolsWithCollection.push({ address: poolAddr, collection });
          } catch (error) {
            console.warn("Could not load pool details for", poolAddr);
          }
        }
        
        setExistingPools(poolsWithCollection);
      } catch (error) {
        console.error("Error checking factory ownership:", error);
      }
    };

    checkOwnership();
  }, [provider, account]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createPool = async () => {
    if (!isOwner) {
      alert("Only the factory owner can create pools");
      return;
    }

    if (!formData.nftCollection) {
      alert("Please enter an NFT collection address");
      return;
    }

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(config.FACTORY_ADDRESS, FactoryABI, signer);

      const tx = await factory.createPool(
        formData.nftCollection,
        formData.receiptContract,
        formData.stonerPool,
        formData.swapFeeInWei,
        parseInt(formData.stonerShare)
      );

      const receipt = await tx.wait();
      
      // Find the PoolCreated event
      const poolCreatedEvent = receipt.events?.find(
        event => event.event === 'PoolCreated'
      );
      
      if (poolCreatedEvent) {
        const poolAddress = poolCreatedEvent.args.pool;
        alert(`Pool created successfully!\nAddress: ${poolAddress}`);
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          nftCollection: ''
        }));
      } else {
        alert("Pool created successfully!");
      }
    } catch (error) {
      console.error("Pool creation error:", error);
      alert("Pool creation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <Card>
        <Title>🏭 Swap Pool Factory</Title>
        <InfoSection>
          Connect your wallet to interact with the pool factory.
        </InfoSection>
      </Card>
    );
  }

  return (
    <Card>
      <Title>🏭 Swap Pool Factory</Title>
      
      <InfoSection>
        <p><strong>Factory Address:</strong> {config.FACTORY_ADDRESS}</p>
        <p><strong>Your Status:</strong> {isOwner ? "✅ Factory Owner" : "❌ Not Owner"}</p>
        <p><strong>Total Pools:</strong> {existingPools.length}</p>
      </InfoSection>

      {isOwner && (
        <FormSection>
          <h4>Create New Swap Pool</h4>
          
          <FormRow>
            <Label>NFT Collection:</Label>
            <Input
              type="text"
              placeholder="0x..."
              value={formData.nftCollection}
              onChange={(e) => handleInputChange('nftCollection', e.target.value)}
            />
          </FormRow>

          <FormRow>
            <Label>Receipt Contract:</Label>
            <Input
              type="text"
              value={formData.receiptContract}
              onChange={(e) => handleInputChange('receiptContract', e.target.value)}
            />
          </FormRow>

          <FormRow>
            <Label>Stoner Pool:</Label>
            <Input
              type="text"
              value={formData.stonerPool}
              onChange={(e) => handleInputChange('stonerPool', e.target.value)}
            />
          </FormRow>

          <FormRow>
            <Label>Swap Fee (Wei):</Label>
            <Input
              type="text"
              value={formData.swapFeeInWei}
              onChange={(e) => handleInputChange('swapFeeInWei', e.target.value)}
              placeholder="1000000000000000 (0.001 ETH)"
            />
          </FormRow>

          <FormRow>
            <Label>Stoner Share (%):</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.stonerShare}
              onChange={(e) => handleInputChange('stonerShare', e.target.value)}
            />
          </FormRow>

          <CreateButton 
            onClick={createPool}
            disabled={loading || !formData.nftCollection}
          >
            {loading ? "Creating Pool..." : "Create Pool"}
          </CreateButton>
        </FormSection>
      )}

      <ExistingPoolsSection>
        <h4>Existing Pools ({existingPools.length})</h4>
        {existingPools.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>No pools created yet</p>
        ) : (
          existingPools.map((pool, index) => (
            <PoolItem key={index}>
              <div>
                <strong>Pool {index + 1}:</strong> {pool.address.slice(0, 10)}...{pool.address.slice(-6)}
              </div>
              <div>
                <small>Collection: {pool.collection.slice(0, 8)}...{pool.collection.slice(-4)}</small>
              </div>
            </PoolItem>
          ))
        )}
      </ExistingPoolsSection>
    </Card>
  );
};

export default PoolFactory;

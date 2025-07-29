import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { resolveIPFS } from "../utils/helpers";
import styled from "styled-components";
import SwapPoolABI from "../contracts/SwapPoolABI.json";

const Card = styled.div`
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
  padding: 20px;
  margin: 20px 0;
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
`;

const PoolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PoolTitle = styled.h3`
  margin: 0;
  color: white;
`;

const PoolStats = styled.div`
  display: flex;
  gap: 15px;
  font-size: 14px;
`;

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin: 15px 0;
`;

const NFTItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  cursor: ${props => props.selectable ? 'pointer' : 'default'};
  border: ${props => props.selected ? '2px solid #fff' : '2px solid transparent'};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.selectable ? 'translateY(-5px)' : 'none'};
    box-shadow: ${props => props.selectable ? '0 5px 20px rgba(255, 255, 255, 0.3)' : 'none'};
  }
`;

const NFTImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const TokenId = styled.p`
  margin: 5px 0;
  font-size: 12px;
  font-weight: bold;
`;

const SwapSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
`;

const SwapInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin: 10px 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const SwapButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-top: 10px;
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

const StakeButton = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 10px;
  width: 100%;

  &:hover {
    background: #f57c00;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EnhancedPoolCard = ({ provider, address, account }) => {
  const [nfts, setNfts] = useState([]);
  const [userNfts, setUserNfts] = useState([]);
  const [nftCollection, setNftCollection] = useState(null);
  const [swapFee, setSwapFee] = useState('0');
  const [selectedPoolNft, setSelectedPoolNft] = useState(null);
  const [tokenIdIn, setTokenIdIn] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNFTs = async () => {
      if (!provider) return;

      try {
        const contract = new ethers.Contract(address, SwapPoolABI, provider);
        const collection = await contract.nftCollection();
        const fee = await contract.swapFeeInWei();
        
        setNftCollection(collection);
        setSwapFee(ethers.formatEther(fee));

        const nft = new ethers.Contract(collection, [
          "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
          "function balanceOf(address) view returns (uint256)",
          "function tokenURI(uint256) view returns (string)",
          "function ownerOf(uint256) view returns (address)"
        ], provider);

        // Load pool NFTs
        const poolBalance = await nft.balanceOf(address);
        const poolTokenData = [];
        for (let i = 0; i < poolBalance; i++) {
          const tokenId = await nft.tokenOfOwnerByIndex(address, i);
          const uri = await nft.tokenURI(tokenId);
          try {
            const meta = await fetch(resolveIPFS(uri)).then(res => res.json());
            poolTokenData.push({ 
              tokenId: tokenId.toString(), 
              image: resolveIPFS(meta.image),
              name: meta.name || `NFT #${tokenId.toString()}`
            });
          } catch {
            poolTokenData.push({ 
              tokenId: tokenId.toString(), 
              image: "/logo192.png",
              name: `NFT #${tokenId.toString()}`
            });
          }
        }
        setNfts(poolTokenData);

        // Load user NFTs if account is connected
        if (account) {
          const userBalance = await nft.balanceOf(account);
          const userTokenData = [];
          for (let i = 0; i < userBalance; i++) {
            const tokenId = await nft.tokenOfOwnerByIndex(account, i);
            const uri = await nft.tokenURI(tokenId);
            try {
              const meta = await fetch(resolveIPFS(uri)).then(res => res.json());
              userTokenData.push({ 
                tokenId: tokenId.toString(), 
                image: resolveIPFS(meta.image),
                name: meta.name || `NFT #${tokenId.toString()}`
              });
            } catch {
              userTokenData.push({ 
                tokenId: tokenId.toString(), 
                image: "/logo192.png",
                name: `NFT #${tokenId.toString()}`
              });
            }
          }
          setUserNfts(userTokenData);
        }
      } catch (error) {
        console.error("Error loading NFTs:", error);
      }
    };

    loadNFTs();
  }, [provider, address, account]);

  const executeSwap = async () => {
    if (!selectedPoolNft || !tokenIdIn) return;
    
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(address, SwapPoolABI, signer);
      
      // First approve the NFT
      const nftContract = new ethers.Contract(nftCollection, [
        "function approve(address,uint256)",
        "function setApprovalForAll(address,bool)"
      ], signer);
      
      await nftContract.setApprovalForAll(address, true);
      
      // Execute swap
      const tx = await contract.swapNFT(tokenIdIn, selectedPoolNft.tokenId, {
        value: ethers.parseEther(swapFee)
      });
      await tx.wait();
      
      alert(`Swap successful! You received NFT #${selectedPoolNft.tokenId}`);
      setSelectedPoolNft(null);
      setTokenIdIn('');
    } catch (error) {
      console.error("Swap error:", error);
      alert("Swap failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const stakeNFT = async (tokenId) => {
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(address, SwapPoolABI, signer);
      
      // First approve the NFT
      const nftContract = new ethers.Contract(nftCollection, [
        "function approve(address,uint256)"
      ], signer);
      
      await nftContract.approve(address, tokenId);
      
      // Stake NFT
      const tx = await contract.stakeNFT(tokenId);
      await tx.wait();
      
      alert(`NFT #${tokenId} staked in pool successfully!`);
    } catch (error) {
      console.error("Stake error:", error);
      alert("Stake failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <PoolHeader>
        <PoolTitle>🔄 Swap Pool: {address.slice(0, 6)}...{address.slice(-4)}</PoolTitle>
        <PoolStats>
          <div>NFTs in Pool: {nfts.length}</div>
          <div>Swap Fee: {swapFee} S</div>
        </PoolStats>
      </PoolHeader>

      <div>
        <h4>🏦 Available for Swap ({nfts.length})</h4>
        <NFTGrid>
          {nfts.map(nft => (
            <NFTItem 
              key={nft.tokenId}
              selectable={account}
              selected={selectedPoolNft?.tokenId === nft.tokenId}
              onClick={() => account && setSelectedPoolNft(nft)}
            >
              <NFTImage src={nft.image} alt={nft.name} />
              <TokenId>{nft.name}</TokenId>
              <TokenId>ID: {nft.tokenId}</TokenId>
            </NFTItem>
          ))}
        </NFTGrid>
      </div>

      {account && (
        <>
          <div>
            <h4>👛 Your NFTs ({userNfts.length})</h4>
            <NFTGrid>
              {userNfts.map(nft => (
                <NFTItem key={nft.tokenId}>
                  <NFTImage src={nft.image} alt={nft.name} />
                  <TokenId>{nft.name}</TokenId>
                  <TokenId>ID: {nft.tokenId}</TokenId>
                  <StakeButton 
                    onClick={() => stakeNFT(nft.tokenId)}
                    disabled={loading}
                  >
                    Stake in Pool
                  </StakeButton>
                </NFTItem>
              ))}
            </NFTGrid>
          </div>

          <SwapSection>
            <h4>💱 Execute Swap</h4>
            <p>Selected NFT to receive: {selectedPoolNft ? `#${selectedPoolNft.tokenId}` : 'None'}</p>
            <SwapInput
              type="number"
              placeholder="Enter your NFT Token ID to swap"
              value={tokenIdIn}
              onChange={(e) => setTokenIdIn(e.target.value)}
            />
            <SwapButton 
              onClick={executeSwap}
              disabled={loading || !selectedPoolNft || !tokenIdIn}
            >
              {loading ? "Swapping..." : `Swap for ${swapFee} S`}
            </SwapButton>
          </SwapSection>
        </>
      )}
    </Card>
  );
};

export default EnhancedPoolCard;

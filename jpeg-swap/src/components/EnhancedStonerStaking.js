import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import styled from "styled-components";
import StonerFeePoolABI from "../contracts/StonerFeePoolABI.json";
import StakeReceiptABI from "../contracts/StakeReceiptABI.json";
import config from "../config/config.json";

const Card = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'primary' ? '#4fc3f7' : '#e91e63'};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#29b6f6' : '#c2185b'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const InputSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin: 15px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin: 5px 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const EnhancedStonerStaking = ({ provider, account }) => {
  const [stats, setStats] = useState({
    totalStaked: 0,
    userStaked: 0,
    pendingRewards: 0,
    totalRewards: 0,
    userReceipts: 0
  });
  const [stakeTokenId, setStakeTokenId] = useState('');
  const [unstakeTokenId, setUnstakeTokenId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      if (!provider || !account) return;

      try {
        const stonerContract = new ethers.Contract(
          config.STONER_POOL_ADDRESS, 
          StonerFeePoolABI, 
          provider
        );
        
        const receiptContract = new ethers.Contract(
          config.STAKE_RECEIPT_ADDRESS, 
          StakeReceiptABI, 
          provider
        );

        // Get stats
        const totalStaked = await stonerContract.totalStaked();
        const stakedTokens = await stonerContract.stakedTokens(account);
        const rewards = await stonerContract.rewards(account);
        const totalRewardsClaimed = await stonerContract.totalRewardsClaimed();
        const receiptBalance = await receiptContract.balanceOf(account);

        setStats({
          totalStaked: totalStaked.toString(),
          userStaked: stakedTokens.length,
          pendingRewards: ethers.formatEther(rewards),
          totalRewards: ethers.formatEther(totalRewardsClaimed),
          userReceipts: receiptBalance.toString()
        });
      } catch (error) {
        console.error("Error loading staking stats:", error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [provider, account]);

  const stakeNFT = async () => {
    if (!stakeTokenId) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(config.STONER_POOL_ADDRESS, StonerFeePoolABI, signer);
      const tx = await contract.stake(stakeTokenId);
      await tx.wait();
      alert(`NFT #${stakeTokenId} staked successfully!`);
      setStakeTokenId('');
    } catch (error) {
      console.error("Staking error:", error);
      alert("Staking failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const unstakeNFT = async () => {
    if (!unstakeTokenId) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(config.STONER_POOL_ADDRESS, StonerFeePoolABI, signer);
      const tx = await contract.unstake(unstakeTokenId);
      await tx.wait();
      alert(`NFT #${unstakeTokenId} unstaked successfully!`);
      setUnstakeTokenId('');
    } catch (error) {
      console.error("Unstaking error:", error);
      alert("Unstaking failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(config.STONER_POOL_ADDRESS, StonerFeePoolABI, signer);
      const tx = await contract.claimNative();
      await tx.wait();
      alert("Rewards claimed successfully!");
    } catch (error) {
      console.error("Claim error:", error);
      alert("Claim failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title>🔥 Enhanced $STONER Staking Pool</Title>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalStaked}</StatValue>
          <StatLabel>Total NFTs Staked</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.userStaked}</StatValue>
          <StatLabel>Your Staked NFTs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{parseFloat(stats.pendingRewards).toFixed(4)}</StatValue>
          <StatLabel>Pending Rewards (S)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.userReceipts}</StatValue>
          <StatLabel>Stake Receipts</StatLabel>
        </StatCard>
      </StatsGrid>

      <InputSection>
        <h4>Stake NFT</h4>
        <Input
          type="number"
          placeholder="Enter NFT Token ID to stake"
          value={stakeTokenId}
          onChange={(e) => setStakeTokenId(e.target.value)}
        />
        <ActionButton 
          variant="primary" 
          onClick={stakeNFT} 
          disabled={loading || !stakeTokenId}
        >
          {loading ? "Staking..." : "Stake NFT"}
        </ActionButton>
      </InputSection>

      <InputSection>
        <h4>Unstake NFT</h4>
        <Input
          type="number"
          placeholder="Enter NFT Token ID to unstake"
          value={unstakeTokenId}
          onChange={(e) => setUnstakeTokenId(e.target.value)}
        />
        <ActionButton 
          variant="secondary" 
          onClick={unstakeNFT} 
          disabled={loading || !unstakeTokenId}
        >
          {loading ? "Unstaking..." : "Unstake NFT"}
        </ActionButton>
      </InputSection>

      <ButtonGrid>
        <ActionButton 
          variant="primary" 
          onClick={claimRewards} 
          disabled={loading || parseFloat(stats.pendingRewards) === 0}
        >
          {loading ? "Claiming..." : `Claim ${parseFloat(stats.pendingRewards).toFixed(4)} S`}
        </ActionButton>
      </ButtonGrid>

      <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
        Total Platform Rewards Claimed: {parseFloat(stats.totalRewards).toFixed(4)} S
      </div>
    </Card>
  );
};

export default EnhancedStonerStaking;

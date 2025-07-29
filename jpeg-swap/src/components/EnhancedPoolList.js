import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import FactoryABI from "../contracts/SwapPoolFactoryABI.json";
import EnhancedPoolCard from "./EnhancedPoolCard";
import config from "../../public/config/config.json";
import styled from "styled-components";

const Container = styled.div`
  margin: 20px 0;
`;

const Title = styled.h2`
  color: #4fc3f7;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
`;

const StatsBar = styled.div`
  background: linear-gradient(135deg, #333 0%, #555 100%);
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  color: white;
  text-align: center;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
`;

const StatItem = styled.div`
  font-size: 16px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #757575;
  font-style: italic;
  padding: 40px;
  font-size: 18px;
`;

const EnhancedPoolList = ({ provider, account }) => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [factoryStats, setFactoryStats] = useState({
    totalPools: 0,
    factoryAddress: config.FACTORY_ADDRESS
  });

  useEffect(() => {
    const loadPools = async () => {
      if (!provider) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const factory = new ethers.Contract(config.FACTORY_ADDRESS, FactoryABI, provider);
        const addresses = await factory.getAllPools();
        
        setPools(addresses);
        setFactoryStats({
          totalPools: addresses.length,
          factoryAddress: config.FACTORY_ADDRESS
        });
      } catch (error) {
        console.error("Error loading pools:", error);
        setPools([]);
      } finally {
        setLoading(false);
      }
    };

    loadPools();
  }, [provider]);

  return (
    <Container>
      <Title>🏊‍♂️ Swap Pool Marketplace</Title>
      
      <StatsBar>
        <StatRow>
          <StatItem>
            <strong>Total Pools:</strong> {factoryStats.totalPools}
          </StatItem>
          <StatItem>
            <strong>Factory:</strong> {factoryStats.factoryAddress.slice(0, 10)}...{factoryStats.factoryAddress.slice(-6)}
          </StatItem>
          <StatItem>
            <strong>Network:</strong> {config.NETWORK.NAME}
          </StatItem>
        </StatRow>
      </StatsBar>

      {loading ? (
        <LoadingMessage>🔄 Loading swap pools...</LoadingMessage>
      ) : pools.length === 0 ? (
        <LoadingMessage>No swap pools found. Be the first to create one!</LoadingMessage>
      ) : (
        <div>
          {pools.map((addr, idx) => (
            <EnhancedPoolCard 
              key={idx} 
              address={addr} 
              provider={provider} 
              account={account}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default EnhancedPoolList;

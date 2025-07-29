import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import GlobalStyles from "./styles/GlobalStyles";
import EnhancedPoolList from "./components/EnhancedPoolList";
import EnhancedStonerStaking from "./components/EnhancedStonerStaking";
import StakeReceipts from "./components/StakeReceipts";
import PoolFactory from "./components/PoolFactory";
import styled from "styled-components";
import config from "../public/config/config.json";

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  padding: 30px 0;
  color: white;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: 20px;
`;

const ConnectButton = styled.button`
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 195, 247, 0.4);
  }
`;

const NetworkInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  margin: 20px auto;
  max-width: 600px;
  color: white;
  text-align: center;
`;

const ContractsInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  margin: 20px auto;
  max-width: 800px;
  color: white;
`;

const ContractRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 5px;
  }
`;

const ContractName = styled.span`
  font-weight: bold;
  color: #4fc3f7;
`;

const ContractAddress = styled.span`
  font-family: monospace;
  font-size: 14px;
  opacity: 0.9;
`;

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connect();
          }
        } catch (error) {
          console.log("Not connected yet");
        }
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask or another web3 wallet!");
        return;
      }

      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      const network = await prov.getNetwork();
      
      setProvider(prov);
      setAccount(addr);
      setNetworkInfo(network);

      // Check if on correct network
      if (Number(network.chainId) !== config.NETWORK.ID) {
        alert(`Please switch to ${config.NETWORK.NAME} (Chain ID: ${config.NETWORK.ID})`);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setAccount(null);
    setNetworkInfo(null);
  };

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Header>
          <Title>🖼️ JPEG Swap DApp</Title>
          <Subtitle>
            Comprehensive NFT Swap & Staking Platform on {config.NETWORK.NAME}
          </Subtitle>
          
          {account ? (
            <div>
              <ConnectButton onClick={disconnect}>
                Disconnect {account.slice(0, 6)}...{account.slice(-4)}
              </ConnectButton>
              {networkInfo && (
                <NetworkInfo>
                  <strong>Network:</strong> {networkInfo.name} (ID: {Number(networkInfo.chainId)})
                  {Number(networkInfo.chainId) !== config.NETWORK.ID && (
                    <div style={{ color: '#ff6b6b', marginTop: '10px' }}>
                      ⚠️ Please switch to {config.NETWORK.NAME}
                    </div>
                  )}
                </NetworkInfo>
              )}
            </div>
          ) : (
            <ConnectButton onClick={connect}>
              Connect Wallet
            </ConnectButton>
          )}
        </Header>

        <ContractsInfo>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#4fc3f7' }}>
            📋 Deployed Contracts
          </h3>
          <ContractRow>
            <ContractName>🏭 SwapPoolFactory</ContractName>
            <ContractAddress>{config.FACTORY_ADDRESS}</ContractAddress>
          </ContractRow>
          <ContractRow>
            <ContractName>🔥 StonerFeePool</ContractName>
            <ContractAddress>{config.STONER_POOL_ADDRESS}</ContractAddress>
          </ContractRow>
          <ContractRow>
            <ContractName>🎫 StakeReceipt</ContractName>
            <ContractAddress>{config.STAKE_RECEIPT_ADDRESS}</ContractAddress>
          </ContractRow>
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', opacity: '0.8' }}>
            SwapPool contracts are created dynamically via the factory
          </div>
        </ContractsInfo>

        {provider && account && (
          <>
            {/* Enhanced Stoner Staking with StakeReceipt integration */}
            <EnhancedStonerStaking provider={provider} account={account} />
            
            {/* Stake Receipts Display */}
            <StakeReceipts provider={provider} account={account} />
            
            {/* Pool Factory Management */}
            <PoolFactory provider={provider} account={account} />
            
            {/* Enhanced Pool List with SwapPool functionality */}
            <EnhancedPoolList provider={provider} account={account} />
          </>
        )}

        {!provider && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: 'white', 
            opacity: 0.8 
          }}>
            <h3>🚀 Welcome to JPEG Swap DApp</h3>
            <p>Connect your wallet to start swapping NFTs and earning rewards!</p>
            <div style={{ marginTop: '30px' }}>
              <h4>✨ Features:</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>🔄 NFT Swapping via SwapPool contracts</li>
                <li>🔥 Stake NFTs in StonerFeePool for rewards</li>
                <li>🎫 Earn StakeReceipt NFTs when staking</li>
                <li>🏭 Create new swap pools via Factory contract</li>
              </ul>
            </div>
          </div>
        )}
      </AppContainer>
    </>
  );
}

export default App;

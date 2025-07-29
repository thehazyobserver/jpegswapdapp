import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { resolveIPFS } from "../utils/helpers";
import styled from "styled-components";
import StakeReceiptABI from "../contracts/StakeReceiptABI.json";
import config from "../../public/config/config.json";

const Card = styled.div`
  background: #1a1a2e;
  padding: 20px;
  margin: 20px 0;
  border-radius: 15px;
  color: white;
  border: 2px solid #16213e;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h3`
  color: #4fc3f7;
  margin-bottom: 15px;
  text-align: center;
`;

const ReceiptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const ReceiptItem = styled.div`
  background: #0f3460;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #16213e;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(79, 195, 247, 0.3);
  }
`;

const ReceiptImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const TokenId = styled.p`
  margin: 5px 0;
  font-size: 14px;
  color: #b0bec5;
`;

const NoReceipts = styled.div`
  text-align: center;
  color: #757575;
  font-style: italic;
  padding: 20px;
`;

const StakeReceipts = ({ provider, account }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStakeReceipts = async () => {
      if (!provider || !account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const receiptContract = new ethers.Contract(
          config.STAKE_RECEIPT_ADDRESS, 
          StakeReceiptABI, 
          provider
        );

        // Get balance of stake receipts for the user
        const balance = await receiptContract.balanceOf(account);
        const receiptData = [];

        for (let i = 0; i < Number(balance); i++) {
          try {
            const tokenId = await receiptContract.tokenOfOwnerByIndex(account, i);
            const tokenURI = await receiptContract.tokenURI(tokenId);
            
            // Try to fetch metadata if URI exists
            let metadata = { name: `Stake Receipt #${tokenId.toString()}` };
            if (tokenURI) {
              try {
                const response = await fetch(resolveIPFS(tokenURI));
                if (response.ok) {
                  metadata = await response.json();
                }
              } catch (metaError) {
                console.warn("Failed to fetch metadata for token", tokenId.toString());
              }
            }

            receiptData.push({
              tokenId: tokenId.toString(),
              name: metadata.name || `Stake Receipt #${tokenId.toString()}`,
              image: metadata.image ? resolveIPFS(metadata.image) : "/logo192.png"
            });
          } catch (tokenError) {
            console.warn("Failed to load token at index", i, tokenError);
          }
        }

        setReceipts(receiptData);
      } catch (error) {
        console.error("Error loading stake receipts:", error);
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    };

    loadStakeReceipts();
  }, [provider, account]);

  return (
    <Card>
      <Title>🎫 Your Stake Receipts</Title>
      {loading ? (
        <NoReceipts>Loading stake receipts...</NoReceipts>
      ) : receipts.length === 0 ? (
        <NoReceipts>No stake receipts found. Stake some NFTs to earn receipts!</NoReceipts>
      ) : (
        <>
          <p style={{ textAlign: "center", color: "#b0bec5", marginBottom: "15px" }}>
            You have {receipts.length} stake receipt{receipts.length !== 1 ? "s" : ""}
          </p>
          <ReceiptGrid>
            {receipts.map((receipt) => (
              <ReceiptItem key={receipt.tokenId}>
                <ReceiptImage 
                  src={receipt.image} 
                  alt={receipt.name}
                  onError={(e) => {
                    e.target.src = "/logo192.png";
                  }}
                />
                <TokenId>{receipt.name}</TokenId>
                <TokenId>ID: {receipt.tokenId}</TokenId>
              </ReceiptItem>
            ))}
          </ReceiptGrid>
        </>
      )}
    </Card>
  );
};

export default StakeReceipts;

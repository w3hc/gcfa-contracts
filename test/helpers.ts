import { ethers } from "hardhat";

// Generate a random Ethereum address
export const getRandomAddress = async () => {
  return ethers.Wallet.createRandom().address;
};
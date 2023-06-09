import hre, { ethers, network, artifacts } from "hardhat";
import fs from "fs";
const color = require("cli-color");
var msg = color.xterm(39).bgXterm(128);
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("\nDeployment in progress...");

  let euroAddress;
  let recoveryAddress;
  const [recovery] = await ethers.getSigners();
  recoveryAddress = recovery.address;
  switch (network.name) {
    case "alfajores": 
      euroAddress = process.env.EURM_ALFAJORES_CONTRACT_ADDRESS;
      recoveryAddress = process.env.CELO_TESTNET_DAO_ADDRESS;
      break;
    case "arthera-testnet":
      euroAddress = process.env.EURM_ARTHERA_TESTNET_CONTRACT_ADDRESS;
      break;
    case "mantle-testnet":
      recoveryAddress = process.env.MANTLE_TESTNET_DAO_ADDRESS;
    case "goerli":
      // deploy EUR
      const EUR = await ethers.getContractFactory("EURMock");
      const eur = await EUR.deploy();
      await eur.deployed();
      console.log("\nEURMock contract deployed at", msg(eur.address), "✅");
      const receipt = await ethers.provider.getTransactionReceipt(
        eur.deployTransaction.hash
      );
      console.log("\nBlock number:", msg(receipt.blockNumber));
      euroAddress = eur.address;
      break;
    case "chiado":
      euroAddress = process.env.EURM_CHIADO_CONTRACT_ADDRESS;
      console.log('process.env.EURM_CHIADO_CONTRACT_ADDRESS:', euroAddress);
      recoveryAddress = process.env.GNOSIS_TESTNET_DAO_ADDRESS;
      console.log('recovery addr when chiado:', recoveryAddress);
      break;
    case "celo":
      euroAddress = process.env.CEUR_CONTRACT_ADDRESS;
      break;
    
    case "gnosis":
      euroAddress = process.env.EURE_CONTRACT_ADDRESS;
      recoveryAddress = process.env.GNOSIS_MAINNET_DAO_ADDRESS;
      break;

    default:
      console.error("Unsupported network");
      break;
  }

  // deploy CFA
  const GCFA = await ethers.getContractFactory("gCFA");
  const rate = 655957;
  console.log('recoveryAddress: ', recoveryAddress, "euroAddress", euroAddress)
  const gcfa = await GCFA.deploy(euroAddress, recoveryAddress, rate);
  await gcfa.deployed();
  console.log("\ngCFA contract deployed at", msg(gcfa.address), "✅");
  switch (network.name) {
    case "alfajores": 
    case "goerli":
      try {
        console.log("\nEURMock contract Etherscan verification in progress...");
        await hre.run("verify:verify", {
          network: network.name,
          address: euroAddress,
          constructorArguments: [],
          contract: "contracts/EURMock.sol:EURMock",
        });
        console.log("Etherscan verification done. ✅");
      } catch (error) {
        console.error(error);
      }
    case "celo":
    case "gnosis":
      try {
        console.log("\ngCFA contract Etherscan verification in progress...");
        await gcfa.deployTransaction.wait(6);
        await hre.run("verify:verify", {
          network: network.name,
          address: gcfa.address,
          constructorArguments: [euroAddress, recoveryAddress, rate],
          contract: "contracts/gCFA.sol:gCFA",
        });
        console.log("Etherscan verification done. ✅");
      } catch (error) {
        console.error(error);
      }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

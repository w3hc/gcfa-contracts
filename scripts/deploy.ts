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
  let nameService;
  const [deployer] = await ethers.getSigners();
  recoveryAddress = deployer.address;
  switch (network.name) {
    case "alfajores": 

      const EUR_alfajores = await ethers.getContractFactory("EURMock");
      const eur_alfajores = await EUR_alfajores.deploy();
      await eur_alfajores.deployed();
      console.log("\nEURMock contract deployed at", msg(eur_alfajores.address), "✅");
      euroAddress = eur_alfajores.address;

      try {
        console.log("\nEURMock contract Etherscan verification in progress...");
        await eur_alfajores.deployTransaction.wait(6);
        await hre.run("verify:verify", {
          network: network.name,
          address: euroAddress,
          constructorArguments: [],
          contract: "contracts/mocks/EURMock.sol:EURMock",
        });
        console.log("NameServiceMock Etherscan verification done. ✅");
      } catch (error) {
        console.error(error);
      }

      const IdentityMock = await ethers.getContractFactory("IdentityMock");
      const identity = await IdentityMock.deploy();
      await identity.deployed();
      await identity.addWhitelisted(deployer.address);
      console.log("identity addr:", identity.address);
      try {
        console.log("\nIdentityMock contract Etherscan verification in progress...");
        await identity.deployTransaction.wait(6);
        await hre.run("verify:verify", {
          network: network.name,
          address: identity.address,
          constructorArguments: [],
          contract: "contracts/mocks/IdentityMock.sol:IdentityMock",
        });
        console.log("IdentityMock Etherscan verification done. ✅");
      } catch (error) {
        console.error(error);
      }

      const NameServiceMock = await ethers.getContractFactory("NameServiceMock");
      const alfajoresNameService = await NameServiceMock.deploy(identity.address);
      await alfajoresNameService.deployed();
      console.log("alfajoresNameService addr:", alfajoresNameService.address);
      try {
        console.log("\nalfajoresNameService contract Etherscan verification in progress...");
        await identity.deployTransaction.wait(6);
        await hre.run("verify:verify", {
          network: network.name,
          address: alfajoresNameService.address,
          constructorArguments: [identity.address],
          contract: "contracts/mocks/NameServiceMock.sol:NameServiceMock",
        });
        console.log("NameServiceMock Etherscan verification done. ✅");
      } catch (error) {
        console.error(error);
      }

      euroAddress = process.env.EURM_ALFAJORES_CONTRACT_ADDRESS;
      recoveryAddress = process.env.CELO_TESTNET_DAO_ADDRESS;
      nameService = alfajoresNameService.address;
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
      
      try {
        console.log("\nEURMock contract Etherscan verification in progress...");
        await eur.deployTransaction.wait(6);
        await hre.run("verify:verify", {
          network: network.name,
          address: eur.address,
          constructorArguments: [],
          contract: "contracts/mocks/EURMock.sol:EURMock",
        });
        console.log("Etherscan verification done. ✅");
      } catch (error) {
        console.error(error);
      }

      break;
    case "chiado":
      euroAddress = process.env.EURM_CHIADO_CONTRACT_ADDRESS;
      console.log('process.env.EURM_CHIADO_CONTRACT_ADDRESS:', euroAddress);
      recoveryAddress = process.env.GNOSIS_TESTNET_DAO_ADDRESS;
      console.log('recovery addr when chiado:', recoveryAddress);
      break;
    case "celo":
      euroAddress = process.env.CEUR_CONTRACT_ADDRESS;
      nameService = process.env.CELO_NAMESERVICE_ADDRESS
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
  console.log('recoveryAddress: ', recoveryAddress, "\neuroAddress", euroAddress, "\nnameService", nameService)
  const gcfa = await GCFA.deploy(euroAddress, recoveryAddress, rate, nameService);
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
    case "goerli":

      try {
        console.log("\ngCFA contract Etherscan verification in progress...");
        await gcfa.deployTransaction.wait(6);
        await hre.run("verify:verify", {
          network: network.name,
          address: gcfa.address,
          constructorArguments: [euroAddress, recoveryAddress, rate, nameService],
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

import hre, { ethers, network, artifacts } from "hardhat";
import fs from "fs";
const color = require("cli-color");
var msg = color.xterm(39).bgXterm(128);
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners()
  const identityContractAddress = "0x4A5C7e56a2e2E6641934522885e843e1dc98fC1f"
  console.log("Interacting with " + identityContractAddress)
  // const abiDir = __dirname + '/../artifacts/contracts';
  // const identityAbiContract = abiDir + "/mocks/" + "IdentityMock.sol" + "/" + "IdentityMock" + ".json"  
  let identityAbi;
  // try {
  //   identityAbi = JSON.parse(fs.readFileSync(identityAbiContract,{encoding:'utf8', flag:'r'}));
  // } catch (error) {
  //   console.log(error)
  //   return;
  // }

  identityAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "addWhitelisted",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "isWhitelisted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "removeWhitelisted",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "whiteListed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

  const identity = new ethers.Contract(identityContractAddress, identityAbi, deployer)

  const whitelistMyself = await identity.addWhitelisted("0x02bC12dAc51024f330fc79bFD651f66946aeF974")

  console.log(await identity.isWhitelisted(deployer.address))
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

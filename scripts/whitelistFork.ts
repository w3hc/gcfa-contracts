import { ethers } from "hardhat";
const color = require("cli-color");
var msg = color.xterm(39).bgXterm(128);
import * as dotenv from "dotenv";
dotenv.config();

// To test whitelisting works on the real Celo chain using ganache-cli fork, open a command prompt and run the following command:
// npx ganache --fork https://celo-mainnet.infura.io/v3/[YourInfuraApiKey]@19812000
// --unlock 0x28e55850F29b49374113f88a452c55ABA63cf862
// --unlock 0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6
// --unlock 0xD533Ca259b330c7A88f74E000a3FaEa2d63B7972
//
// Then on another terminal run "npx hardhat --network ganache run scripts/whitelistFork.ts"


// A test that impersonates two accounts - one whitelisted, and one not whitelist, sends them cEUR from a Celo account,
// and verifies that whitelisted account can deposit on gCFA contract and the not whitelisted cannot deposit.
async function main() {
  console.log("\nTest deployment in progress...");

  const whitelistedAddress = "0x28e55850F29b49374113f88a452c55ABA63cf862"
  const notWhitelistedAddress = "0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6"
  const celoGoveranceAddress = "0xD533Ca259b330c7A88f74E000a3FaEa2d63B7972"

  const [deployer] = await ethers.getSigners();
  let deployerAddress = deployer.address;
  let euroAddress = process.env.CEUR_CONTRACT_ADDRESS || ``;

  const notWhitelistedSigner = await ethers.getSigner(notWhitelistedAddress);
  const whitelistedSigner = await ethers.getSigner(whitelistedAddress);
  const celoSigner = await ethers.getSigner(celoGoveranceAddress);
  const cEURContract = new ethers.Contract(euroAddress, ABI, celoSigner);

  const celoBalanceBefore = await cEURContract.balanceOf(celoGoveranceAddress);
  const notWhitelistedBalanceBefore = await cEURContract.balanceOf(notWhitelistedAddress);
  const whitelistedBalanceBefore = await cEURContract.balanceOf(whitelistedAddress);

  console.log("Celo cEUR balance before transfer %s", ethers.utils.formatEther(celoBalanceBefore));
  console.log("Not whitelisted cEUR balance before transfer %s", ethers.utils.formatEther(notWhitelistedBalanceBefore));
  console.log("Whitelisted cEUR balance before transfer %s", ethers.utils.formatEther(whitelistedBalanceBefore));

  // Send cEUR for depositing
  await cEURContract.connect(celoSigner).transfer(whitelistedAddress, ethers.utils.parseEther("1"));
  await cEURContract.connect(celoSigner).transfer(notWhitelistedAddress, ethers.utils.parseEther("1"));

  const celoBalanceAfter = await cEURContract.balanceOf(celoGoveranceAddress);
  const notWhitelistedBalanceAfter = await cEURContract.balanceOf(notWhitelistedAddress);
  const whitelistedBalanceAfter = await cEURContract.balanceOf(whitelistedAddress);

  console.log("\nCelo cEUR balance after transfer %s", ethers.utils.formatEther(celoBalanceAfter));
  console.log("Not whitelisted cEUR balance after transfer %s", ethers.utils.formatEther(notWhitelistedBalanceAfter));
  console.log("Whitelisted cEUR balance after transfer %s", ethers.utils.formatEther(whitelistedBalanceAfter));

  // deploy CFA
  const GCFA = await ethers.getContractFactory("gCFA");
  const rate = 655957;
  const gcfa = await GCFA.deploy(euroAddress, deployerAddress, rate, process.env.CELO_NAMESERVICE_ADDRESS);
  await gcfa.deployed();
  console.log("\ngCFA contract deployed at", msg(gcfa.address), "✅");

  // Sent notWhitelisted Celo tokens for fees
  const params =
  {
    to: notWhitelistedAddress,
    value: ethers.utils.parseEther("1").toHexString()
  };
  await celoSigner.sendTransaction(params);

  // Approve gCFA to deposit on cEUR contract
  await cEURContract.connect(whitelistedSigner).approve(gcfa.address, ethers.utils.parseEther("1"));
  await cEURContract.connect(notWhitelistedSigner).approve(gcfa.address, ethers.utils.parseEther("1"));

  try {
    await gcfa.connect(whitelistedSigner).depositFor(whitelistedAddress, 1000);
    console.log("\nDid not revert at whitelisted address deposit ✅");
  } catch (error) {
    console.log(error);
  }

  try {
    await gcfa.connect(notWhitelistedSigner).depositFor(notWhitelistedAddress, 1000);
  } catch (e) {
    console.log("\nReverted at not whitelisted address deposit ✅");
    console.log("Error message:\n", (e as Error).message, "\n");
  }
}

const ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "accountOwner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "accountOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy OracleManager
  console.log("\nDeploying OracleManager...");
  const OracleManager = await hre.ethers.getContractFactory("OracleManager");
  const oracleManager = await OracleManager.deploy();
  // await oracleManager.deployed(); // Not needed with Hardhat 2.12.0+
  const oracleManagerAddress = await oracleManager.getAddress();
  console.log("OracleManager deployed to:", oracleManagerAddress);

  // Deploy RequestBridge
  console.log("\nDeploying RequestBridge...");
  const RequestBridge = await hre.ethers.getContractFactory("RequestBridge");
  const requestBridge = await RequestBridge.deploy();
  // await requestBridge.deployed();
  const requestBridgeAddress = await requestBridge.getAddress();
  console.log("RequestBridge deployed to:", requestBridgeAddress);

  // Deploy ResultValidator (needs OracleManager address)
  console.log("\nDeploying ResultValidator...");
  const ResultValidator = await hre.ethers.getContractFactory("ResultValidator");
  const resultValidator = await ResultValidator.deploy(oracleManagerAddress);
  // await resultValidator.deployed();
  const resultValidatorAddress = await resultValidator.getAddress();
  console.log("ResultValidator deployed to:", resultValidatorAddress);

  console.log("\n--- Deployment Complete ---");
  console.log("OracleManager Address:  ", oracleManagerAddress);
  console.log("RequestBridge Address:  ", requestBridgeAddress);
  console.log("ResultValidator Address:", resultValidatorAddress);
  console.log("---------------------------\n");

  // You can save these addresses to a file or use them in other scripts
  // For example, by writing to a JSON file:
  /*
  const fs = require('fs');
  const addresses = {
    oracleManager: oracleManagerAddress,
    requestBridge: requestBridgeAddress,
    resultValidator: resultValidatorAddress,
    network: hre.network.name
  };
  fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("Deployment addresses saved to deployed-addresses.json");
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

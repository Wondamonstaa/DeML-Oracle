const hre = require("hardhat");
const ethers = hre.ethers; // Alias for convenience

async function main() {
  console.log("Placeholder for interact.js script.");
  console.log("This script can be used to interact with the deployed smart contracts.");
  console.log("Make sure to replace placeholder addresses with actual deployed addresses.");

  // --- Configuration ---
  // Replace these with the actual addresses from your deployment output or a config file
  const ORACLE_MANAGER_ADDRESS = "0xReplaceWithOracleManagerAddress";
  const REQUEST_BRIDGE_ADDRESS = "0xReplaceWithRequestBridgeAddress";
  const RESULT_VALIDATOR_ADDRESS = "0xReplaceWithResultValidatorAddress";

  // Get signers (e.g., the deployer or another account to interact from)
  const [deployer, user1, providerAccount] = await ethers.getSigners();
  console.log("\nUsing accounts:");
  console.log("  Deployer/Owner:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  ProviderAccount:", providerAccount.address);


  // --- Example Interactions (Uncomment and modify as needed) ---

  // 1. Interact with OracleManager
  if (ORACLE_MANAGER_ADDRESS !== "0xReplaceWithOracleManagerAddress") {
    console.log("\n--- Interacting with OracleManager ---");
    const OracleManager = await ethers.getContractFactory("OracleManager");
    const oracleManager = OracleManager.attach(ORACLE_MANAGER_ADDRESS);

    // // Example: Register providerAccount as a provider
    // console.log(`Registering ${providerAccount.address} as a provider...`);
    // try {
    //   const txReg = await oracleManager.connect(providerAccount).registerProvider();
    //   await txReg.wait();
    //   console.log("Provider registered successfully. TX:", txReg.hash);
    // } catch (e) {
    //   console.error("Error registering provider:", e.message);
    // }

    // // Example: Check if providerAccount is registered
    // const isRegistered = await oracleManager.isProviderRegistered(providerAccount.address);
    // console.log(`Is ${providerAccount.address} registered? ${isRegistered}`);

    // // Example: Stake for providerAccount
    // if (isRegistered) {
    //   console.log(`Staking 0.1 ETH for ${providerAccount.address}...`);
    //   const stakeAmount = ethers.parseEther("0.1");
    //   try {
    //     const txStake = await oracleManager.connect(providerAccount).stake({ value: stakeAmount });
    //     await txStake.wait();
    //     console.log("Stake successful. TX:", txStake.hash);
    //   } catch (e) {
    //     console.error("Error staking:", e.message);
    //   }
    // }

    // // Example: Get provider's stake
    // const stake = await oracleManager.getProviderStake(providerAccount.address);
    // console.log(`Stake of ${providerAccount.address}: ${ethers.formatEther(stake)} ETH`);
  } else {
    console.log("\nSkipping OracleManager interaction: Address not set.");
  }

  // 2. Interact with RequestBridge
  if (REQUEST_BRIDGE_ADDRESS !== "0xReplaceWithRequestBridgeAddress") {
    console.log("\n--- Interacting with RequestBridge ---");
    const RequestBridge = await ethers.getContractFactory("RequestBridge");
    const requestBridge = RequestBridge.attach(REQUEST_BRIDGE_ADDRESS);

    // // Example: User1 requests a prediction
    // const modelId = 1;
    // const inputData = ethers.toUtf8Bytes("Sample input data for prediction");
    // console.log(`User ${user1.address} requesting prediction for model ${modelId}...`);
    // try {
    //   const txReq = await requestBridge.connect(user1).requestPrediction(inputData, modelId);
    //   const receipt = await txReq.wait();
    //   const event = receipt.logs.find(log => log.eventName === 'PredictionRequested');
    //   if (event) {
    //       console.log(`Prediction requested successfully. Request ID: ${event.args.requestId}, TX: ${txReq.hash}`);
    //   } else {
    //       console.log(`Prediction requested successfully. TX: ${txReq.hash} (Event not parsed here)`);
    //   }
    // } catch (e) {
    //   console.error("Error requesting prediction:", e.message);
    // }
  } else {
    console.log("\nSkipping RequestBridge interaction: Address not set.");
  }

  // 3. Interact with ResultValidator (requires OracleManager setup for provider)
  if (RESULT_VALIDATOR_ADDRESS !== "0xReplaceWithResultValidatorAddress" && ORACLE_MANAGER_ADDRESS !== "0xReplaceWithOracleManagerAddress") {
    console.log("\n--- Interacting with ResultValidator ---");
    // First ensure provider is registered and staked in OracleManager as shown in section 1.
    // const isReallyRegistered = await OracleManager.attach(ORACLE_MANAGER_ADDRESS).isProviderRegistered(providerAccount.address);
    // const currentStake = await OracleManager.attach(ORACLE_MANAGER_ADDRESS).getProviderStake(providerAccount.address);
    // console.log(`Provider ${providerAccount.address} registration: ${isReallyRegistered}, Stake: ${ethers.formatEther(currentStake)} ETH`);

    // if (isReallyRegistered && currentStake > 0) {
    //   const ResultValidator = await ethers.getContractFactory("ResultValidator");
    //   const resultValidator = ResultValidator.attach(RESULT_VALIDATOR_ADDRESS);
    //   const requestIdToSubmit = 1; // Assume this request ID exists from RequestBridge interaction
    //   const predictionData = ethers.toUtf8Bytes("0.85"); // Example prediction data

    //   console.log(`Provider ${providerAccount.address} submitting prediction for request ID ${requestIdToSubmit}...`);
    //   try {
    //     const txSub = await resultValidator.connect(providerAccount).submitPrediction(requestIdToSubmit, predictionData);
    //     await txSub.wait();
    //     console.log(`Prediction submitted successfully. TX: ${txSub.hash}`);
    //   } catch (e) {
    //     console.error("Error submitting prediction:", e.message);
    //   }

    //   // Example: Get submissions for a request
    //   const submissions = await resultValidator.getPredictionsForRequest(requestIdToSubmit);
    //   console.log(`Submissions for request ID ${requestIdToSubmit}:`, submissions.length);
    //   if (submissions.length > 0) {
    //       submissions.forEach(sub => {
    //           console.log(`  Provider: ${sub.provider}, Data: ${ethers.toUtf8String(sub.data)}, Timestamp: ${new Date(Number(sub.timestamp) * 1000)}`);
    //       });
    //   }
    // } else {
    //   console.log("Skipping ResultValidator submission: Provider not sufficiently set up (registered and staked).");
    // }
  } else {
    console.log("\nSkipping ResultValidator interaction: Addresses not set or provider not ready.");
  }

  console.log("\nInteraction script finished. Modify and uncomment sections to perform actions.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

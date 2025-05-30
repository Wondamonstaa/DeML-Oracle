const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RequestBridge", function () {
  let RequestBridge;
  let requestBridge;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    RequestBridge = await ethers.getContractFactory("RequestBridge");
    [owner, user1, user2] = await ethers.getSigners();

    requestBridge = await RequestBridge.deploy();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(requestBridge.target).to.not.be.undefined;
      console.log("RequestBridge deployed to:", requestBridge.target);
    });

    it("Should initialize nextRequestId to 1", async function () {
      expect(await requestBridge.nextRequestId()).to.equal(1);
      console.log("Placeholder: nextRequestId initialized correctly.");
    });
  });

  describe("requestPrediction", function () {
    it("Should allow a user to request a prediction and emit an event", async function () {
      const modelId = 1;
      const inputData = ethers.toUtf8Bytes("Sample input data for model 1");
      const currentRequestId = await requestBridge.nextRequestId();

      await expect(requestBridge.connect(user1).requestPrediction(inputData, modelId))
        .to.emit(requestBridge, "PredictionRequested")
        .withArgs(currentRequestId, user1.address, modelId, inputData);

      expect(await requestBridge.nextRequestId()).to.equal(currentRequestId + BigInt(1));
      console.log("Placeholder: Prediction requested successfully, event emitted, requestId incremented.");
    });

    it("Should increment requestId for multiple requests", async function () {
      const modelId1 = 1;
      const inputData1 = ethers.toUtf8Bytes("Input 1");
      const modelId2 = 2;
      const inputData2 = ethers.toUtf8Bytes("Input 2");

      let expectedRequestId = await requestBridge.nextRequestId();
      await requestBridge.connect(user1).requestPrediction(inputData1, modelId1);
      expect(await requestBridge.nextRequestId()).to.equal(expectedRequestId + BigInt(1));

      expectedRequestId = await requestBridge.nextRequestId();
      await requestBridge.connect(user2).requestPrediction(inputData2, modelId2);
      expect(await requestBridge.nextRequestId()).to.equal(expectedRequestId + BigInt(1));

      console.log("Placeholder: RequestId increments correctly for multiple requests.");
    });

    it("Should return the requestId when called", async function () {
        const modelId = 3;
        const inputData = ethers.toUtf8Bytes("Test data");
        const expectedRequestId = await requestBridge.nextRequestId();

        // Call the non-constant function and check the returned value from the transaction
        // For non-view functions, the typical way to get return value is via events or by calling it as a view function if applicable
        // However, Hardhat's ethers wrapper can often retrieve return values from non-mutating calls if they are simple enough
        // For a function that mutates state and returns a value, you'd typically check the event or subsequent state.
        // Here, we'll test the return value directly for simplicity as Hardhat might allow it.
        // A more robust test would be to capture the event and check its requestId.

        const tx = await requestBridge.connect(user1).requestPrediction(inputData, modelId);
        const receipt = await tx.wait();

        // Find the event in the transaction receipt
        const event = receipt.logs.find(log => log.eventName === 'PredictionRequested');
        expect(event).to.not.be.undefined;
        expect(event.args.requestId).to.equal(expectedRequestId);

        console.log("Placeholder: requestPrediction returns the correct requestId via event.");
    });
  });

  // Add more describe blocks if there were other functionalities
  // e.g., pausing, ownership controls, etc. (not in current contract)
});

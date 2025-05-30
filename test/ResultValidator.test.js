const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResultValidator", function () {
  let OracleManager, ResultValidator;
  let oracleManager, resultValidator;
  let owner, provider1, provider2, nonProvider, user;

  const MIN_STAKE = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, provider1, provider2, nonProvider, user] = await ethers.getSigners();

    // Deploy OracleManager
    OracleManager = await ethers.getContractFactory("OracleManager");
    oracleManager = await OracleManager.deploy();

    // Deploy ResultValidator, linking it to the deployed OracleManager
    ResultValidator = await ethers.getContractFactory("ResultValidator");
    resultValidator = await ResultValidator.deploy(oracleManager.target);

    // Setup: Register and stake provider1
    await oracleManager.connect(provider1).registerProvider();
    await oracleManager.connect(provider1).stake({ value: MIN_STAKE });

    // Setup: Register provider2 but do not stake
    await oracleManager.connect(provider2).registerProvider();
  });

  describe("Deployment", function () {
    it("Should deploy successfully with the correct OracleManager address", async function () {
      expect(resultValidator.target).to.not.be.undefined;
      expect(await resultValidator.oracleManager()).to.equal(oracleManager.target);
      console.log("ResultValidator deployed to:", resultValidator.target);
      console.log("Linked OracleManager:", await resultValidator.oracleManager());
    });
  });

  describe("submitPrediction", function () {
    const requestId = 1;
    const predictionData = ethers.toUtf8Bytes("Sample prediction data");

    it("Should allow a registered and staked provider to submit a prediction", async function () {
      await expect(resultValidator.connect(provider1).submitPrediction(requestId, predictionData))
        .to.emit(resultValidator, "PredictionSubmitted")
        .withArgs(requestId, provider1.address, predictionData);

      const submissions = await resultValidator.getPredictionsForRequest(requestId);
      expect(submissions.length).to.equal(1);
      expect(submissions[0].provider).to.equal(provider1.address);
      expect(submissions[0].data).to.equal(ethers.hexlify(predictionData)); // Event stores bytes, hexlify for comparison
      console.log("Placeholder: Staked provider submitted prediction successfully.");
    });

    it("Should prevent a provider who is registered but not staked from submitting", async function () {
      // provider2 is registered but not staked
      await expect(resultValidator.connect(provider2).submitPrediction(requestId, predictionData))
        .to.be.revertedWith("Provider not registered or not staked");
      console.log("Placeholder: Submission by non-staked (but registered) provider prevented.");
    });

    it("Should prevent a non-registered provider from submitting a prediction", async function () {
      await expect(resultValidator.connect(nonProvider).submitPrediction(requestId, predictionData))
        .to.be.revertedWith("Provider not registered or not staked"); // Fails at getProviderStake > 0
      console.log("Placeholder: Submission by non-registered provider prevented.");
    });

    it("Should store multiple predictions for the same request ID", async function () {
      // provider1 submits first
      await resultValidator.connect(provider1).submitPrediction(requestId, predictionData);

      // Register and stake another provider (e.g., owner for simplicity in this test setup)
      // Note: In a real scenario, provider roles would be distinct.
      await oracleManager.connect(owner).registerProvider(); // owner registers
      await oracleManager.connect(owner).stake({ value: MIN_STAKE }); // owner stakes

      const predictionData2 = ethers.toUtf8Bytes("Another prediction");
      await expect(resultValidator.connect(owner).submitPrediction(requestId, predictionData2))
        .to.emit(resultValidator, "PredictionSubmitted")
        .withArgs(requestId, owner.address, predictionData2);

      const submissions = await resultValidator.getPredictionsForRequest(requestId);
      expect(submissions.length).to.equal(2);
      expect(submissions[1].provider).to.equal(owner.address);
      expect(submissions[1].data).to.equal(ethers.hexlify(predictionData2));
      console.log("Placeholder: Multiple predictions stored for the same request ID.");
    });
  });

  describe("getPredictionsForRequest", function() {
    const requestId1 = 1;
    const requestId2 = 2;
    const predictionData1 = ethers.toUtf8Bytes("Data for req 1");

    it("Should return an empty array for a request ID with no submissions", async function() {
      const submissions = await resultValidator.getPredictionsForRequest(99); // Non-existent requestId
      expect(submissions.length).to.equal(0);
      console.log("Placeholder: getPredictionsForRequest returns empty for no submissions.");
    });

    it("Should return all predictions for a given request ID", async function() {
      await resultValidator.connect(provider1).submitPrediction(requestId1, predictionData1);

      // Another provider (owner) submits to the same request
      await oracleManager.connect(owner).registerProvider();
      await oracleManager.connect(owner).stake({ value: MIN_STAKE });
      const predictionDataOwner = ethers.toUtf8Bytes("Owner data for req 1");
      await resultValidator.connect(owner).submitPrediction(requestId1, predictionDataOwner);

      // provider1 submits to a different request
      const predictionDataReq2 = ethers.toUtf8Bytes("Data for req 2 by P1");
      await resultValidator.connect(provider1).submitPrediction(requestId2, predictionDataReq2);

      const submissionsForReq1 = await resultValidator.getPredictionsForRequest(requestId1);
      expect(submissionsForReq1.length).to.equal(2);
      expect(submissionsForReq1[0].provider).to.equal(provider1.address);
      expect(submissionsForReq1[1].provider).to.equal(owner.address);

      const submissionsForReq2 = await resultValidator.getPredictionsForRequest(requestId2);
      expect(submissionsForReq2.length).to.equal(1);
      expect(submissionsForReq2[0].provider).to.equal(provider1.address);

      console.log("Placeholder: getPredictionsForRequest returns correct predictions.");
    });
  });
});

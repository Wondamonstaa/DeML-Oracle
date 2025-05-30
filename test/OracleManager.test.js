const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OracleManager", function () {
  let OracleManager;
  let oracleManager;
  let owner;
  let provider1;
  let provider2;
  let nonProvider;

  const MIN_STAKE = ethers.parseEther("0.1"); // Using ethers.parseEther for correct formatting

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    OracleManager = await ethers.getContractFactory("OracleManager");
    [owner, provider1, provider2, nonProvider] = await ethers.getSigners();

    // Deploy a new OracleManager contract before each test.
    oracleManager = await OracleManager.deploy();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(oracleManager.target).to.not.be.undefined; //שהחוזה נפרס בהצלחה
      console.log("OracleManager deployed to:", oracleManager.target);
    });
  });

  describe("Provider Registration", function () {
    it("Should allow a new provider to register", async function () {
      await expect(oracleManager.connect(provider1).registerProvider())
        .to.emit(oracleManager, "ProviderRegistered")
        .withArgs(provider1.address);
      expect(await oracleManager.isProviderRegistered(provider1.address)).to.equal(true);
      console.log("Placeholder: provider1 registered successfully.");
    });

    it("Should prevent an already registered provider from registering again", async function () {
      await oracleManager.connect(provider1).registerProvider();
      await expect(oracleManager.connect(provider1).registerProvider())
        .to.be.revertedWith("Provider already registered");
      console.log("Placeholder: Re-registration prevented.");
    });
  });

  describe("Staking", function () {
    beforeEach(async function() {
      // Register provider1 before staking tests
      await oracleManager.connect(provider1).registerProvider();
    });

    it("Should allow a registered provider to stake the minimum amount", async function () {
      await expect(oracleManager.connect(provider1).stake({ value: MIN_STAKE }))
        .to.emit(oracleManager, "ProviderStaked")
        .withArgs(provider1.address, MIN_STAKE);
      expect(await oracleManager.getProviderStake(provider1.address)).to.equal(MIN_STAKE);
      console.log("Placeholder: provider1 staked successfully.");
    });

    it("Should prevent a non-registered provider from staking", async function () {
      await expect(oracleManager.connect(nonProvider).stake({ value: MIN_STAKE }))
        .to.be.revertedWith("Provider not registered");
      console.log("Placeholder: Staking by non-registered provider prevented.");
    });

    it("Should prevent staking below the minimum amount", async function () {
      const lessThanMinStake = ethers.parseEther("0.05");
      await expect(oracleManager.connect(provider1).stake({ value: lessThanMinStake }))
        .to.be.revertedWith("Minimum stake amount not met");
      console.log("Placeholder: Staking below minimum amount prevented.");
    });

    it("Should accumulate stakes for a provider", async function () {
      await oracleManager.connect(provider1).stake({ value: MIN_STAKE });
      await oracleManager.connect(provider1).stake({ value: ethers.parseEther("0.2") });
      expect(await oracleManager.getProviderStake(provider1.address)).to.equal(ethers.parseEther("0.3"));
      console.log("Placeholder: Stakes accumulated correctly.");
    });
  });

  describe("getProviderStake", function() {
    it("Should return 0 for a provider with no stake", async function() {
      expect(await oracleManager.getProviderStake(provider1.address)).to.equal(0);
      console.log("Placeholder: getProviderStake returns 0 for no stake.");
    });
  });
});

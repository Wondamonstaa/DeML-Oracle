/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// This is a basic Hardhat configuration file.
// For a more complete setup, you might want to install and import
// plugins like "@nomicfoundation/hardhat-toolbox".

module.exports = {
  solidity: {
    version: "0.8.19", // Compatible with contracts using ^0.8.0
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts", // Location of your Solidity contracts
    tests: "./test",        // Location of your test files
    cache: "./cache",       // Hardhat's cache directory
    artifacts: "./artifacts", // Directory for compiled contract artifacts
  },
  defaultNetwork: "hardhat", // Default network to use when running Hardhat tasks
  networks: {
    hardhat: {
      // Default Hardhat Network configuration
      // It's an in-memory network, good for testing
    },
    localhost: {
      url: "http://127.0.0.1:8545", // URL for a local Ethereum node (e.g., Hardhat Node, Ganache)
      // accounts: [privateKey1, privateKey2, ...] // Optional: for deploying or interacting
    },
    // You can add other networks like testnets (e.g., sepolia, goerli) or mainnet here
    // sepolia: {
    //   url: "YOUR_SEPOLIA_RPC_URL",
    //   accounts: ["YOUR_PRIVATE_KEY"]
    // }
  },
};

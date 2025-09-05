require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    "somnia-testnet": {
      url: "https://testnet-rpc.somnia.network",
      chainId: 1946,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      "somnia-testnet": "your-somnia-api-key", // Replace with actual API key
    },
    customChains: [
      {
        network: "somnia-testnet",
        chainId: 1946,
        urls: {
          apiURL: "https://testnet-explorer.somnia.network/api",
          browserURL: "https://testnet-explorer.somnia.network",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();

const sepoliaApiUrl =
  "https://eth-sepolia.g.alchemy.com/v2/" + process.env.SEPOLIA_API_KEY;
const georliApiUrl =
  "https://eth-goerli.g.alchemy.com/v2/" + process.env.GEORLI_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: sepoliaApiUrl,
      accounts: [process.env.SEPOLIA_ACCOUNT],
      chainId: 11155111,
    },
    goerli: {
      url: georliApiUrl,
      accounts: [process.env.GEORLI_ACCOUNT],
      chainId: 5,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      localhost: 0,
      sepolia: 0,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: false,
    noColors: true,
    outputFile: "gas-reporter.txt",
  },
  solidity: "0.8.19",
};

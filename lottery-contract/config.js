const { network } = require("hardhat");
const networkConfigs = {
  31337: {
    name: "hardhat",
    dev: true,
    vrfCoordinator: "",
    minEth: "0.01",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subId: "",
    callbackGasLimit: 500000,
    interval: 60,
  },
  11155111: {
    name: "sepolia",
    dev: false,
    vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    minEth: "0.01",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subId: "5474",
    callbackGasLimit: 2500000,
    interval: 60,
  },
  5: {
    name: "goerli",
    dev: false,
    vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    minEth: "0.01",
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subId: "",
    callbackGasLimit: 500000,
    interval: 60,
  },
};

const dev = ["localhost", "hardhat"].includes(network.name);

module.exports = {
  networkConfigs,
  dev,
};

const { networkConfigs } = require("../config");
const { ethers } = require("hardhat");
const verify = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts, getChainId }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  const networkConfig = networkConfigs[chainId];

  let vrfCoordinator = networkConfig.vrfCoordinator;
  let vrfCoordinatorMock;
  let subId = networkConfig.subId;
  if (networkConfig.dev) {
    vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinator = vrfCoordinatorMock.target;
    const resp = await vrfCoordinatorMock.createSubscription();
    const receipt = await resp.wait(1);
    subId = receipt.logs[0].args.subId;

    await vrfCoordinatorMock.fundSubscription(subId, ethers.parseEther("1"));
  }

  const args = [
    vrfCoordinator,
    ethers.parseEther(networkConfig.minEth),
    networkConfig.gasLane,
    subId,
    networkConfig.callbackGasLimit,
    networkConfig.interval,
  ];

  const lottery = await deployments.deploy("Lottery", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: 1,
  });

  if (networkConfig.dev) {
    await vrfCoordinatorMock.addConsumer(subId, lottery.address);
  }

  // verify contract
  if (!networkConfig.dev && process.env.ETHERSCAN_API_KEY) {
    await verify(lottery.address, args);
  }
};

module.exports.tags = ["all", "lottery"];

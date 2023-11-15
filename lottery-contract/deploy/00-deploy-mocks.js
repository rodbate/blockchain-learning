const { networkConfigs } = require("../config");
const BASE_FEE = "250000000000000000";
const GAS_PRICE_LINK = 1e9;

module.exports = async ({ deployments, getNamedAccounts, getChainId }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  if (networkConfigs[chainId].dev) {
    await deployments.deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK],
      log: true,
    });
  }
};

module.exports.tags = ["all", "mocks"];

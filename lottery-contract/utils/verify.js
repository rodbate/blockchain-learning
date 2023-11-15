const hre = require("hardhat");

module.exports = async (contractAddr, args) => {
  console.log("Verifying Contract ... ");
  try {
    await hre.run("verify:verify", {
      address: contractAddr,
      constructorArguments: args,
    });
  } catch (e) {
    console.log("Verify Contract Error", e);
  }
};

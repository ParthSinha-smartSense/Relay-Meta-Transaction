const Counter = artifacts.require("counterMetaV2");

module.exports = async (deployer) => {
  await deployer.deploy(Counter);
};
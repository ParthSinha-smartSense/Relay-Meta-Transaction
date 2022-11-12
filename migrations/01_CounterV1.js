const Counter = artifacts.require("counterMeta");

module.exports = async (deployer) => {
  await deployer.deploy(Counter);
};

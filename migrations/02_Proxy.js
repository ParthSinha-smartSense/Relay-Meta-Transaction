const proxy = artifacts.require("Proxy");
const counter = artifacts.require("counterMeta");

module.exports = async (deployer) => {
  await deployer.deploy(proxy, counter.address);
};

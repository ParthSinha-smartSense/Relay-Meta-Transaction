const proxy = artifacts.require("Proxy");
const counter = artifacts.require("Relay");

module.exports = async (deployer) => {
  await deployer.deploy(counter, proxy.address);
};
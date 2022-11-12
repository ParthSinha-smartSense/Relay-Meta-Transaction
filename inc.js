const Counter = artifacts.require("counterMeta");
const Relay = artifacts.require("Relay");
const Proxy = artifacts.require("Proxy");
const truffleAssert = require('truffle-assertions');
const { accounts } = require('./truffle-helper.js');

module.exports = async function (i) {
  nonce = await web3.eth.getTransactionCount(accounts[i]['public_key']);
// console.log(  accounts[i]['public_key']);
// console.log( accounts[i]['private-key'])
  // counter = await Counter.deployed();
  // relay = await Relay.deployed();
  // proxy = await Proxy.deployed();
  data = await web3.eth.abi.encodeFunctionCall(
    {
      name: "inc",
      type: "function",
      inputs: [
        {
          type: "address",
          name: "_addr",
        },
      ],
    },
   
    [accounts[i]['public_key']]
  );

  hash = await web3.utils.soliditySha3(data);
  //console.log("data",data)
  message = await web3.eth.abi.encodeParameters(
    ["bytes1", "bytes1", "uint256", "address", "address", "bytes"],
    [
      web3.utils.toHex(25),
      web3.utils.toHex(0),
      nonce,
      accounts[i]['public_key'],
      relay.address,
      data,
    ]
  );
  sign = await web3.eth.accounts.sign(
    await web3.utils.soliditySha3(message),
    accounts[i]['private-key']//"019b17f2a228c36f5b518a1e9e385cd21bcfcc77d28b02d06532442320801b86"
  );
  await truffleAssert.passes(relay.relayTx.call(sign.signature, nonce, data),"Call failed");
  await relay.relayTx
    .sendTransaction(sign.signature, nonce, data)
    //.then(console.log);
 // callback();
};

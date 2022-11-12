const chainID = config.network_id;
const truffleAssertions = require("truffle-assertions");
const { accounts } = require("../../truffle-helper");
const Proxy = artifacts.require("Proxy");
const Relay = artifacts.require("Relay");
const counterV1 = artifacts.require("counterMeta");
const counterV2 = artifacts.require("counterMetaV2");
const truffleAssert = require("truffle-assertions");
const inc = require("../../inc.js");
const dec = require("../../dec.js");

(5777 == chainID ? contract : contract.skip)(
  "Contract Name : ProxyMetaTxn",
  async () => {
    var contractInstance;
    before(async function () {
      proxy = await Proxy.deployed();
      relay = await Relay.deployed();
      v1 = await counterV1.deployed();
      v2 = await counterV2.deployed();
    });
    async function sendTxn(accounts) {
      nonce = await web3.eth.getTransactionCount(accounts[0]["public_key"]);
      // console.log(  accounts[0]['public_key']);
      // console.log( accounts[0]['private-key'])

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

        [accounts[0]["public_key"]]
      );

      hash = await web3.utils.soliditySha3(data);
      //console.log("data",data)
      message = await web3.eth.abi.encodeParameters(
        ["bytes1", "bytes1", "uint256", "address", "address", "bytes"],
        [
          web3.utils.toHex(25),
          web3.utils.toHex(0),
          nonce,
          accounts[0]["public_key"],
          relay.address,
          data,
        ]
      );
      sign = await web3.eth.accounts.sign(
        await web3.utils.soliditySha3(message),
        accounts[0]["private-key"] //"019b17f2a228c36f5b518a1e9e385cd21bcfcc77d28b02d06532442320801b86"
      );
      await truffleAssert.passes(
        relay.relayTx.call(sign.signature, nonce, data),
        "Call failed"
      );
      await relay.relayTx
        .sendTransaction(sign.signature, nonce, data)
        .then(console.log);
    }
    it("Test case - Contracts deployed successfully", async () => {
      assert.equal(
        proxy.address != 0,
        relay.address != 0,
        "Incorrect deployment of contracts"
      );
    });

    it("Test case - Correct Implementation set in Proxy", async () => {
      proxy._getImplementation
        .call()
        .then((x) =>
          assert.equal(x, v1.address, "Incorrect implementation set")
        );
    });

    it("Test case - Send Transaction to Relay #1 ", async () => {
      await inc(4);
      await proxy.count
        .call(accounts[4]["public_key"])
        .then((x) => assert.equal(x, 1, "Increment failed"));
    });

    it("Test case - Send Transaction to Relay #2 ", async () => {
      await inc(2);
      await proxy.count
        .call(accounts[2]["public_key"])
        .then((x) => assert.equal(x, 1, "Increment failed"));
    });

    it("Test case - Change Version", async () => {
      await proxy._setImplementation.sendTransaction(v2.address);
      proxy._getImplementation
        .call()
        .then((x) =>
          assert.equal(x, v2.address, "Incorrect implementation set")
        );
    });

    it("Test case - Decrement Counter #1", async()=>{
        await dec(2);
      await proxy.count
        .call(accounts[2]["public_key"])
        .then((x) => assert.equal(x, 0, "Increment failed"));
    })

    it("Test case - Decrement Counter #2", async()=>{
        await dec(4);
      await proxy.count
        .call(accounts[4]["public_key"])
        .then((x) => assert.equal(x, 0, "Increment failed"));
    })
  }
);

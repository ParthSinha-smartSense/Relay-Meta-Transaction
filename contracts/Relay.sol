// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
//0xd7bb0559000000000000000000000000288898eb5f862ee1d3d5445846e4ea8a8dc06a03
contract Relay {
    address public instance;
    mapping(bytes32 => bool) txnsDone;

    constructor(address _contract) {
        instance = _contract;
    }

    function setter(address _addr) external {
        instance = _addr;
    }

    function verify(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 nonce,
        bytes memory data
    ) internal {
        address claimedsigner = getAddress(data);
        bytes32 hash = keccak256(
            abi.encode(
                bytes1(0x19),
                bytes1(0x0),
                nonce,
                claimedsigner,
                address(this),
                data
            )
        );
        bytes32 ethsigned = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        require(!txnsDone[ethsigned], "Transaction already executed");
        require(
            ecrecover(ethsigned, v, r, s) == claimedsigner,
            "Signature incorrect"
        );

        txnsDone[ethsigned] = true;
        executeTxn(data);
    }

    function relayTx(
        bytes memory signature,
        uint256 nonce,
        bytes memory data
    ) external  {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        verify(v, r, s, nonce, data);
        
    }

    function executeTxn(bytes memory data) public {
        (bool success,) = instance.call(data);
        require(success, "Call failed");
    }

    function getAddress(bytes memory b) internal pure returns (address a) {
        if (b.length < 36) return address(0);
        assembly {
            let mask := 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
            a := and(mask, mload(add(b, 36)))
            // 36 is the offset of the first parameter of the data, if encoded properly.
            // 32 bytes for the length of the bytes array, and 4 bytes for the function signature.
        }
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
    }
}

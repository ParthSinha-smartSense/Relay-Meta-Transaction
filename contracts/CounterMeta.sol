// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract counterMeta {
    mapping(address => uint256) public count;

    function inc(address _addr) external {
        count[_addr]++;
    }
}

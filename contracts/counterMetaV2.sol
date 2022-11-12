// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract counterMetaV2 {
    mapping(address => uint256) public count;

    function inc(address _addr) external {
        count[_addr]++;
    }

    function dec(address _addr) external {
        count[_addr]--;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title A mock to GoodDollar's simple name to address resolver
 */
contract NameServiceMock {
	mapping(bytes32 => address) public addresses;

	constructor(address _identity) {
		addresses[keccak256(bytes("IDENTITY"))] = _identity;
	}

	function setAddress(string memory _name, address _addr) external {
		addresses[keccak256(bytes(_name))] = _addr;
	}

	function getAddress(string memory _name) external view returns (address) {
		return addresses[keccak256(bytes(_name))];
	}
}

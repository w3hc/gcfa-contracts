// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title Simple mock to GoodDollar's identity contract responsible for whitelisting
 */
contract IdentityMock {
	mapping(address => bool) public whiteListed;

	function isWhitelisted(address _address) external view returns (bool) {
		return whiteListed[_address];
	}

	function addWhitelisted(address _address) external {
		whiteListed[_address] = true;
	}

	function removeWhitelisted(address _address) external {
		whiteListed[_address] = false;
	}
}

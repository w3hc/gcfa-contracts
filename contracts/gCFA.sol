// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC20Wrapper.sol";

/**
 * @dev gCFA ERC20 token wrapped from Euro stablecoin
 *
 * Users can deposit Euro stablecoin and receive a matching number of gCFA.
 * Users can withdraw gCFA and receive a matching number of Euro stablecoin.
 */
contract gCFA is ERC20Wrapper {
	constructor(
		IERC20 wrappedToken,
		address recoveryAddress,
		uint256 rate,
		INameService nameService
	)
		ERC20Wrapper(
			"Good CFA",
			"gCFA",
			wrappedToken,
			recoveryAddress,
			rate,
			nameService
		)
	{}
}

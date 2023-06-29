// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @custom:security-contact good@juglas.name
contract EURMock is ERC20 {
    constructor() ERC20("EURMock", "EURm") {
        _mint(msg.sender, 1525 * 10 ** decimals());
    }

    function mint() public {
        _mint(msg.sender, 100 * 10 ** decimals());
    }

    function decimals() public pure override(ERC20) returns (uint8) {
        return 18;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
   constructor(uint256 initalSupply) ERC20("MyToken", "MTK") {
      _mint(msg.sender, initalSupply);
   }
}

// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

library SafeMath {
   error SafeMath__InvalidInput();

   function addNumber(uint256 a, uint256 b) internal pure returns (uint256) {
      return a + b;
   }
}

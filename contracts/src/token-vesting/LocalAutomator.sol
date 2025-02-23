// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { TokenVesting } from "@src/token-vesting/TokenVesting.sol";

contract LocalAutomator {
   event AutomationTriggered(uint256 timestamp, bool wasNeeded);

   TokenVesting public vesting;
   uint256 public lastCheck;
   uint256 public constant INTERVAL = 5;
   address public owner;
   bool public isRunning;

   constructor(TokenVesting _vesting) {
      vesting = _vesting;
      lastCheck = block.timestamp;
      owner = msg.sender;
      isRunning = true;
   }

   modifier onlyOwner() {
      require(msg.sender == owner, "Not owner");
      _;
   }

   function checkAndExecute() external returns (bool) {
      require(isRunning, "Automation stopped");
      require(block.timestamp >= lastCheck + INTERVAL, "Too early");

      (bool needsUpkeep, bytes memory performData) = vesting.checkUpkeep("");

      if (needsUpkeep) {
         vesting.performUpkeep(performData);
      }

      lastCheck = block.timestamp;
      emit AutomationTriggered(block.timestamp, needsUpkeep);
      return needsUpkeep;
   }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract LocalAutomator {
   event AutomationTriggered(uint256 timestamp, bool wasNeeded);

   AutomationCompatibleInterface public targetContract;
   uint256 public lastCheck;
   uint256 public interval;
   address public owner;
   bool public isRunning;

   constructor(address _targetContract, uint256 _interval, address _owner) {
      targetContract = AutomationCompatibleInterface(_targetContract);
      interval = _interval > 0 ? _interval : 5 minutes;
      lastCheck = block.timestamp;
      owner = _owner;
      isRunning = true;
   }

   receive() external payable { }

   modifier onlyOwner() {
      require(msg.sender == owner, "Not owner");
      _;
   }

   function checkAndExecute() external returns (bool) {
      require(isRunning, "Automation stopped");
      require(block.timestamp >= lastCheck + interval, "Too early");

      (bool needsUpkeep, bytes memory performData) = targetContract.checkUpkeep("");

      if (needsUpkeep) {
         targetContract.performUpkeep(performData);
      }

      lastCheck = block.timestamp;
      emit AutomationTriggered(block.timestamp, needsUpkeep);
      return needsUpkeep;
   }

   // Update interval (in seconds)
   function setInterval(uint256 _interval) external onlyOwner {
      require(_interval > 0, "Interval must be positive");
      interval = _interval;
   }

   // Pause automation
   function stopAutomation() external onlyOwner {
      isRunning = false;
   }

   // Resume automation
   function startAutomation() external onlyOwner {
      isRunning = true;
   }

   // Update target contract
   function setTargetContract(address _targetContract) external onlyOwner {
      require(_targetContract != address(0), "Invalid contract address");
      targetContract = AutomationCompatibleInterface(_targetContract);
   }
}

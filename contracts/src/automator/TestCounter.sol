// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
/**
 * @title TestCounter
 * @dev A simple contract that needs periodic upkeep to increment a counter
 * Implements the Chainlink Keeper compatible interface for automation
 */

contract TestCounter is AutomationCompatibleInterface {
   uint256 public counter;
   uint256 public lastTimestamp;
   uint256 public interval;
   address public owner;

   event CounterIncremented(uint256 newValue, uint256 timestamp);
   event IntervalUpdated(uint256 newInterval);

   constructor(uint256 _interval) {
      counter = 0;
      interval = _interval;
      lastTimestamp = block.timestamp;
      owner = msg.sender;
   }

   modifier onlyOwner() {
      require(msg.sender == owner, "Not owner");
      _;
   }

   /**
    * @dev Called by Chainlink Keeper/Automator to check if upkeep is needed
    * @return upkeepNeeded true if the counter needs to be incremented
    * @return performData bytes data to be used by performUpkeep
    */
   // Chainlink Automation Functions
   function checkUpkeep(bytes calldata /* checkData */ )
      external
      view
      override
      returns (bool upkeepNeeded, bytes memory performData)
   {
      upkeepNeeded = (block.timestamp - lastTimestamp) > interval;
      performData = ""; // Not used in this simple example
      return (upkeepNeeded, performData);
   }

   /**
    * @dev Called by Chainlink Keeper/Automator when checkUpkeep returns true
    */
   function performUpkeep(bytes calldata) external override {
      // Re-validate the upkeep condition
      if ((block.timestamp - lastTimestamp) <= interval) {
         revert("Upkeep not needed");
      }

      // Perform the upkeep - increment counter
      counter++;
      lastTimestamp = block.timestamp;

      // Emit event
      emit CounterIncremented(counter, block.timestamp);
   }

   /**
    * @dev Allows the owner to update the interval
    * @param _interval new interval in seconds
    */
   function setInterval(uint256 _interval) external onlyOwner {
      interval = _interval;
      emit IntervalUpdated(_interval);
   }

   /**
    * @dev For testing - manually increment the counter
    */
   function manualIncrement() external onlyOwner {
      counter++;
      lastTimestamp = block.timestamp;
      emit CounterIncremented(counter, block.timestamp);
   }

   /**
    * @dev View function to see when next upkeep is due
    */
   function nextUpkeepTime() external view returns (uint256) {
      return lastTimestamp + interval;
   }

   /**
    * @dev View function to check if upkeep is currently needed
    */
   function isUpkeepNeeded() external view returns (bool) {
      return (block.timestamp - lastTimestamp) > interval;
   }
}

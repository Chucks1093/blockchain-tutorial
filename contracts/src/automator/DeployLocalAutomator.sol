// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { LocalAutomator } from "@src/automator/LocalAutomator.sol";

contract DeployLocalAutomator {
   event AutomatorDeployed(address indexed targetContract, address automator, uint256 interval);

   // Maps target contracts to their automators
   mapping(address => address) public contractToAutomator;

   /**
    * @notice Deploy a new LocalAutomator for a target contract
    * @param targetContract Address of the contract to automate (must implement Keeper interface)
    * @param interval Time interval in seconds between automation checks
    * @return automator Address of the newly deployed automator
    */
   function deployAutomator(address targetContract, uint256 interval, address _owner) public returns (address) {
      require(targetContract != address(0), "Invalid target contract");
      require(interval > 0, "Interval must be positive");

      // Deploy the new automator contract
      LocalAutomator automator = new LocalAutomator(targetContract, interval, _owner);

      // Store the mapping
      contractToAutomator[targetContract] = address(automator);

      // Emit the event
      emit AutomatorDeployed(targetContract, address(automator), interval);

      return address(automator);
   }

   /**
    * @notice Get the automator for a specific target contract
    * @param targetContract Address of the target contract
    * @return Address of the corresponding automator
    */
   function getAutomator(address targetContract) public view returns (address) {
      return contractToAutomator[targetContract];
   }
}

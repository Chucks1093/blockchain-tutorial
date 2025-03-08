// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { LocalAutomator } from "@src/automator/LocalAutomator.sol";
import { LinkToken } from "@chainlink/contracts/src/v0.8/shared/token/ERC677/LinkToken.sol";
import { ERC677 } from "@chainlink/contracts/src/v0.8/shared/token/ERC677/ERC677.sol"; // Import the ERC677 interface

contract DeployLocalAutomator {
   error DeployLocalAutomator__UnAuthorisedAccess();

   event AutomatorDeployed(address indexed targetContract, address automator, uint256 interval);

   // Maps target contracts to their automators
   mapping(address => address) public contractToAutomator;

   address public feeCollector;
   uint256 public gasMultiplier = 110;

   LinkToken public immutable linkToken;

   constructor() {
      LinkToken link = new LinkToken();

      link.grantMintRole(msg.sender);

      link.mint(msg.sender, 1_000_000 * 10 ** 18);

      linkToken = link;
   }

   modifier onlyFeeCollector() {
      if (msg.sender != feeCollector) revert DeployLocalAutomator__UnAuthorisedAccess();
      _;
   }

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
      LocalAutomator automator =
         new LocalAutomator(targetContract, interval, _owner, address(linkToken), feeCollector, gasMultiplier);

      // Store the mapping
      contractToAutomator[targetContract] = address(automator);

      // Emit the event
      emit AutomatorDeployed(targetContract, address(automator), interval);

      return address(automator);
   }

   // Set fee collector address
   function setFeeCollector(address _feeCollector) external onlyFeeCollector {
      require(_feeCollector != address(0), "Invalid fee collector address");
      feeCollector = _feeCollector;
   }

   // Update gas multiplier (percentage)
   function setGasMultiplier(uint256 _multiplier) external onlyFeeCollector {
      require(_multiplier >= 100, "Multiplier must be at least 100%");
      gasMultiplier = _multiplier;
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

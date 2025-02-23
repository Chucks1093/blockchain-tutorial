// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { TokenVesting } from "@src/token-vesting/TokenVesting.sol";
import { MyToken } from "@src/token-vesting/MyToken.sol";
import { RegisterAutomation } from "./Interactions.s.sol";
import { HelperConfig } from "./HelperConfig.s.sol";
import { ChainInfo } from "@src/shared/ChainInfo.sol";
import { LocalAutomator } from "@src/token-vesting/LocalAutomator.sol";

contract TokenVestingScript is Script, ChainInfo {
   MyToken token;
   TokenVesting vesting;
   uint256 upkeepId;
   LocalAutomator public automator;

   error DeploymentFailed(string reason);

   function run() external returns (MyToken, TokenVesting, HelperConfig.NetworkConfig memory, LocalAutomator, uint256) {
      // Get configuration
      HelperConfig config = new HelperConfig();
      HelperConfig.NetworkConfig memory networkConfig = config.getConfig();

      // Start deployment
      vm.startBroadcast();

      try this.deploy(networkConfig) returns (MyToken _token, TokenVesting _vesting, LocalAutomator _automator) {
         token = _token;
         vesting = _vesting;
         automator = _automator;

         console.log("=== Deployment Successful ===");
         console.log("Token:", address(token));
         console.log("Vesting:", address(vesting));

         if (address(automator) != address(0)) {
            console.log("Automator:", address(automator));
         }

         // Verify contracts have code
         require(address(token).code.length > 0, "Token not deployed");
         require(address(vesting).code.length > 0, "Vesting not deployed");
      } catch Error(string memory reason) {
         revert DeploymentFailed(reason);
      }

      vm.stopBroadcast();

      // Handle automation registration
      if (block.chainid != ANVIL_CHAIN_ID) {
         vm.startBroadcast();
         RegisterAutomation automationRegistrar = new RegisterAutomation();
         upkeepId = automationRegistrar.registerAutomationForVesting(address(vesting));
         console.log("Registered for automation with upkeepId:", upkeepId);
         vm.stopBroadcast();
      }

      return (token, vesting, networkConfig, automator, upkeepId);
   }

   function deploy(HelperConfig.NetworkConfig memory networkConfig)
      external
      returns (MyToken _token, TokenVesting _vesting, LocalAutomator _automator)
   {
      // Deploy Token
      _token = new MyToken(networkConfig.initialTokenSupply);
      console.log("Token deployed at:", address(_token));

      // Deploy Vesting
      _vesting = new TokenVesting(address(_token));
      console.log("Vesting deployed at:", address(_vesting));

      // Approve vesting contract
      _token.approve(address(_vesting), _token.totalSupply());
      console.log("Approved vesting contract to spend tokens");

      // Deploy automator for local chain
      if (block.chainid == ANVIL_CHAIN_ID) {
         _automator = new LocalAutomator(_vesting);
         console.log("LocalAutomator deployed at:", address(_automator));

         // Set up mocks if needed
         if (networkConfig.linkToken != address(0)) {
            console.log("Mock LINK token available at:", networkConfig.linkToken);
            console.log("Mock Registry available at:", networkConfig.automationRegistry);
            console.log("Mock Registrar available at:", networkConfig.automationRegistrar);
         }
      }
   }
}

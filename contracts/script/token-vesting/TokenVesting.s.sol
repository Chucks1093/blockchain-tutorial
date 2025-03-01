// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { TokenVesting } from "@src/token-vesting/TokenVesting.sol";
import { MyToken } from "@src/token-vesting/MyToken.sol";
import { RegisterAutomation } from "./Interactions.s.sol";
import { HelperConfig } from "./HelperConfig.s.sol";
import { ChainInfo } from "@src/shared/ChainInfo.sol";

contract TokenVestingScript is Script, ChainInfo {
   MyToken token;
   TokenVesting vesting;
   uint256 upkeepId;

   error DeploymentFailed(string reason);

   function run() external returns (MyToken, TokenVesting, HelperConfig.NetworkConfig memory, uint256) {
      // Get configuration
      HelperConfig config = new HelperConfig();
      HelperConfig.NetworkConfig memory networkConfig = config.getConfig();

      // Start deployment
      vm.startBroadcast();

      try this.deploy(networkConfig) returns (MyToken _token, TokenVesting _vesting) {
         token = _token;
         vesting = _vesting;

         console.log("=== Deployment Successful ===");
         console.log("Token:", address(token));
         console.log("Vesting:", address(vesting));

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

      return (token, vesting, networkConfig, upkeepId);
   }

   function deploy(HelperConfig.NetworkConfig memory networkConfig)
      external
      returns (MyToken _token, TokenVesting _vesting)
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
   }
}

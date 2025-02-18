// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { TokenVesting } from "../../src/token-vesting/TokenVesting.sol";
import { MyToken } from "../../src/token-vesting/MyToken.sol";
import { RegisterAutomation } from "./Interactions.s.sol";
import { HelperConfig } from "./HelperConfig.s.sol";

contract TokenVestingScript is Script {
   MyToken token;
   TokenVesting vesting;
   uint256 upkeepId;

   function run() external returns (MyToken, TokenVesting, HelperConfig.NetworkConfig memory, uint256) {
      HelperConfig config = new HelperConfig();
      HelperConfig.NetworkConfig memory networkConfig = config.getConfig();

      vm.startBroadcast(networkConfig.deployer);

      // 1. Deploy Token
      token = new MyToken(networkConfig.initialTokenSupply);
      console.log("MyToken deployed at:", address(token));

      // 2. Deploy Vesting
      vesting = new TokenVesting(address(token));
      console.log("TokenVesting deployed at:", address(vesting));

      // 3. Approve vesting contract
      token.approve(address(vesting), token.totalSupply());
      console.log("Approved vesting contract to spend tokens");

      vm.stopBroadcast();

      // 4. Register Automation (if not on Anvil)
      if (block.chainid != 31337) {
         RegisterAutomation automationRegistrar = new RegisterAutomation();
         upkeepId = automationRegistrar.registerAutomationForVesting(address(vesting));
         console.log("Registered for automation with upkeepId:", upkeepId);
      }

      return (token, vesting, networkConfig, upkeepId);
   }
}

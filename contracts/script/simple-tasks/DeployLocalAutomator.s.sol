//SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { console, Script } from "forge-std/Script.sol";
import { DeployLocalAutomator } from "@src/automator/DeployLocalAutomator.sol";

contract DeployLocalAutomatorScript is Script {
   function run() external returns (DeployLocalAutomator) {
      vm.startBroadcast();
      DeployLocalAutomator deployLocalAutomator = new DeployLocalAutomator();

      vm.stopBroadcast();
      console.log("DeployLocalAutomator contract deployed at :", address(deployLocalAutomator));
      return deployLocalAutomator;
   }
}

//SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { console, Script } from "forge-std/Script.sol";
import { DeployLocalAutomator } from "@src/automator/DeployLocalAutomator.sol";
import { TestCounter } from "@src/automator/TestCounter.sol";

contract DeployLocalAutomatorScript is Script {
   function run() external returns (DeployLocalAutomator) {
      vm.startBroadcast();
      TestCounter testCounter = new TestCounter(10);
      DeployLocalAutomator deployLocalAutomator = new DeployLocalAutomator();

      vm.stopBroadcast();
      console.log("TestCounter contract deployed at :", address(testCounter));
      console.log("DeployLocalAutomator contract deployed at :", address(deployLocalAutomator));
      return deployLocalAutomator;
   }
}

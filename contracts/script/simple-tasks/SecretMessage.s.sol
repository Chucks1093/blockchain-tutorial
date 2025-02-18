// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { SecretMessage } from "@simple-tasks/SecretMessage.sol";

contract SecretMessageScript is Script {
   string public INITIAL_MESSAGE = "THIS IS A GOOD DAY";

   function run() external {
      vm.startBroadcast();
      new SecretMessage(INITIAL_MESSAGE);
      vm.stopBroadcast();
   }
}

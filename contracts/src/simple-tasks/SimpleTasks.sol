// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SafeMath } from "@libraries/SafeMath.sol"; // Adjusted import path;
import { SecretMessage } from "./SecretMessage.sol";

contract SimpleTasks {
   string public INITIAL_MESSAGE = "THIS IS A GOOD DAY";

   constructor() {
      new SecretMessage(INITIAL_MESSAGE);
   }
}

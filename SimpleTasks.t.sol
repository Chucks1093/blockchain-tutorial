// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { SimpleTasks } from "@simple-tasks/SimpleTasks.sol";

contract SimpleTasksTest is Test {
   SimpleTasks simpleTasks;

   function setUp() public {
      simpleTasks = new SimpleTasks();
   }

   function testCheckifAddIsTrue() public view {
      uint256 a = 3;
      uint256 b = 3;
      assertEq(simpleTasks.getSum(a, b), 6);
   }
}

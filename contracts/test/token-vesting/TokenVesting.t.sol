// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Test, console } from "forge-std/Test.sol";

import { TokenVestingScript } from "@script/token-vesting/TokenVesting.s.sol";
import { TokenVesting } from "@src/token-vesting/TokenVesting.sol";
import { HelperConfig } from "@script/token-vesting/HelperConfig.s.sol";
import { MyToken } from "@src/token-vesting/MyToken.sol";

contract TokenVestingTest is Test {
   TokenVestingScript tokenVestingScript;
   TokenVesting tokenVesting;
   MyToken token;
   address owner;
   address firstBeneficiary;
   address secondBeneficiary;
   HelperConfig.NetworkConfig networkConfig;

   function setUp() public {
      tokenVestingScript = new TokenVestingScript();
      (token, tokenVesting, networkConfig,) = tokenVestingScript.run();
      firstBeneficiary = makeAddr("firstBeneficiary");
      secondBeneficiary = makeAddr("secondBeneficiary");
      owner = networkConfig.deployer;
   }

   function testCreateVestingSchdule() public {
      vm.startPrank(owner);
      tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
      tokenVesting.createVestingSchedule(secondBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
      TokenVesting.VestingSchedule[] memory vestingSchedules = tokenVesting.getAllVestingSchedules();
      assertEq(vestingSchedules.length, 2);
   }
}

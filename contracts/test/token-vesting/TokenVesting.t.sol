// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { TokenVestingScript } from "@script/token-vesting/TokenVesting.s.sol";
import { TokenVesting } from "@src/token-vesting/TokenVesting.sol";
import { HelperConfig } from "@script/token-vesting/HelperConfig.s.sol";
import { MyToken } from "@src/token-vesting/MyToken.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { LocalAutomator } from "@src/token-vesting/LocalAutomator.sol";

contract TokenVestingTest is Test {
   TokenVestingScript tokenVestingScript;
   TokenVesting tokenVesting;
   MyToken token;
   address deployer;
   address firstBeneficiary;
   address secondBeneficiary;
   HelperConfig.NetworkConfig networkConfig;
   LocalAutomator automator;

   function setUp() public {
      tokenVestingScript = new TokenVestingScript();
      (token, tokenVesting, networkConfig, automator,) = tokenVestingScript.run();
      firstBeneficiary = makeAddr("firstBeneficiary");
      secondBeneficiary = makeAddr("secondBeneficiary");
      deployer = networkConfig.deployer;
   }

   function testInitialSuppy() public view {
      uint256 deployerBalance = token.balanceOf(deployer);
      assertEq(deployerBalance, networkConfig.initialTokenSupply);
   }

   function testTokenTransfers() public {
      uint256 transferAmount = 20 * (10 ** 18);
      vm.prank(deployer);
      token.transfer(firstBeneficiary, transferAmount);
      assertEq(token.balanceOf(deployer), networkConfig.initialTokenSupply - transferAmount);
      assertEq(token.balanceOf(firstBeneficiary), transferAmount);
   }

   function testOnlyOwnerCanCreateSchedule() public {
      vm.prank(firstBeneficiary);
      vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, firstBeneficiary));
      tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
   }

   function testCreateVestingScheduleWithInvalidInputs() public {
      vm.startPrank(deployer);
      vm.expectRevert(TokenVesting.TokenVesting_InvalidInput.selector);
      tokenVesting.createVestingSchedule(address(0), 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
   }

   function testCannotCreateWithCliffEqualDuration() public {
      vm.startPrank(deployer);
      vm.expectRevert(TokenVesting.TokenVesting_InvalidInput.selector);
      tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 3, TokenVesting.ReleaseFrequency.Monthly);
   }

   function testCreateVestingSchedule() public {
      vm.startPrank(deployer);
      tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
      tokenVesting.createVestingSchedule(secondBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
      TokenVesting.VestingSchedule[] memory vestingSchedules = tokenVesting.getAllVestingSchedules();
      assertEq(vestingSchedules.length, 2);
   }

   function testRevokeVestingSchedule() public {
      vm.startPrank(deployer);
      uint256 scheduleID =
         tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
      tokenVesting.revoke(scheduleID);
      TokenVesting.VestingSchedule memory vestingSchedule = tokenVesting.getVestingScheduleDetails(scheduleID);
      assertTrue(vestingSchedule.revoked);
   }

   function testReleasedTokensAfterCliff() public {
      vm.prank(deployer);
      uint256 scheduleID =
         tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
      TokenVesting.VestingSchedule memory vestingSchedule = tokenVesting.getVestingScheduleDetails(scheduleID);

      // After cliff ends
      vm.warp(vestingSchedule.startTime + vestingSchedule.cliffDuration + 20);

      uint256 releasableAmount = tokenVesting.getNextReleaseAmount(scheduleID);
      uint256 expectedTokenReleasedAfterCliff = (1000 * 3) / 12;

      console.log("expectedTokenReleasedAfterCliff :", expectedTokenReleasedAfterCliff);
      assertEq(releasableAmount, expectedTokenReleasedAfterCliff);
      automator.checkAndExecute();
      assertEq(token.balanceOf(firstBeneficiary), releasableAmount);
   }

   function testCannotReleaseBeforeCliff() public {
      vm.prank(deployer);
      uint256 scheduleID =
         tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 12, TokenVesting.ReleaseFrequency.Monthly);
      TokenVesting.VestingSchedule memory vestingSchedule = tokenVesting.getVestingScheduleDetails(scheduleID);

      // Before cliff ends
      vm.warp(vestingSchedule.startTime + vestingSchedule.cliffDuration);
      uint256 releasableAmount = tokenVesting.getNextReleaseAmount(scheduleID);
      assertEq(releasableAmount, 0);
      automator.checkAndExecute();
      assertEq(token.balanceOf(firstBeneficiary), 0);
   }

   function testReleaseWithQuarterlyFrequency() public {
      vm.prank(deployer);
      uint256 scheduleID =
         tokenVesting.createVestingSchedule(firstBeneficiary, 1000, 3, 14, TokenVesting.ReleaseFrequency.Quarterly);
      TokenVesting.VestingSchedule memory vestingSchedule = tokenVesting.getVestingScheduleDetails(scheduleID);
      // First period
      vm.warp(vestingSchedule.startTime + (12 * 30 days) + 10);
      uint256 firstReleasableAmount = tokenVesting.getNextReleaseAmount(scheduleID);
      automator.checkAndExecute();

      // Get updated schedule after first release
      TokenVesting.VestingSchedule memory scheduleAfterFirst = tokenVesting.getVestingScheduleDetails(scheduleID);
      console.log("first releasable Amount:", firstReleasableAmount);
      console.log("first release", scheduleAfterFirst.releasedAmount);

      // Second period
      vm.warp(block.timestamp + (2 * 30 days) + 10);
      uint256 secondReleasableAmount = tokenVesting.getNextReleaseAmount(scheduleID);
      automator.checkAndExecute();

      // Get updated schedule after second release
      TokenVesting.VestingSchedule memory scheduleAfterSecond = tokenVesting.getVestingScheduleDetails(scheduleID);
      console.log("second releasable Amount:", secondReleasableAmount);
      console.log("second release", scheduleAfterSecond.releasedAmount);

      assertEq(scheduleAfterSecond.releasedAmount, scheduleAfterSecond.totalAmount);

      assertEq(token.balanceOf(firstBeneficiary), scheduleAfterSecond.totalAmount);
   }
}

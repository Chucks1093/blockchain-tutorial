// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { TokenVestingScript } from "@script/token-vesting/TokenVesting.s.sol";
import { TokenVesting } from "@src/token-vesting/TokenVesting.sol";
import { HelperConfig } from "@script/token-vesting/HelperConfig.s.sol";
import { MyToken } from "@src/token-vesting/MyToken.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVestingTest is Test {
   TokenVestingScript tokenVestingScript;
   TokenVesting tokenVesting;
   MyToken token;
   address deployer;
   address firstBeneficiary;
   address secondBeneficiary;
   HelperConfig.NetworkConfig networkConfig;

   function setUp() public {
      tokenVestingScript = new TokenVestingScript();
      (token, tokenVesting, networkConfig,) = tokenVestingScript.run();
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

      uint256 releableAmount = tokenVesting.getNextReleaseAmount(scheduleID);
      uint256 expectedTokenReleasedAfterCliff = (1000 * 3) / 12;

      console.log("expectedTokenReleasedAfterCliff :", expectedTokenReleasedAfterCliff);
      assertEq(releableAmount, expectedTokenReleasedAfterCliff);
      assertEq(token.balanceOf(firstBeneficiary), networkConfig.initialTokenSupply - 1000 * 10 ** 18);
   }
}

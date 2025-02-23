// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract TokenVesting is Ownable, ReentrancyGuard, Pausable, AutomationCompatibleInterface {
   using SafeERC20 for IERC20;

   IERC20 public token;

   // Errors
   error TokenVesting_InvalidInput();
   error TokenVesting_NoTokensToRelease();
   error TokenVesting_StillInCliffPeriod();
   error TokenVesting_VestingPeriodEnded();
   error TokenVesting_InvalidFrequency();

   // Events
   event CreatedVestingSchedule(
      address indexed beneficiary, uint256 indexed scheduleID, uint256 totalAmount, uint256 cliffDuration
   );
   event TokensReleased(uint256 indexed scheduleID, address indexed beneficiary, uint256 amount);
   event ScheduleRevoked(uint256 indexed scheduleID, address indexed beneficiary, uint256 remainingAmount);

   // Enums
   enum ReleaseFrequency {
      Monthly,
      Quarterly,
      Yearly
   }

   // Structs
   struct VestingSchedule {
      address beneficiary;
      uint256 totalAmount;
      uint256 releasedAmount;
      uint256 startTime;
      uint256 cliffDuration;
      uint256 duration;
      bool revoked;
      ReleaseFrequency releaseFrequency;
   }

   // State variables
   VestingSchedule[] public vestingSchedules;

   // Mapping
   mapping(address => uint256[]) public beneficiaryVestingSchedules;

   constructor(address _token) Ownable(msg.sender) {
      token = IERC20(_token);
   }

   receive() external payable { }

   // Modifiers
   modifier scheduleExists(uint256 _scheduleID) {
      if (_scheduleID >= vestingSchedules.length || vestingSchedules[_scheduleID].beneficiary == address(0)) {
         revert TokenVesting_InvalidInput();
      }
      _;
   }

   // Chainlink Automation Functions
   function checkUpkeep(bytes calldata /* checkData */ )
      external
      view
      override
      returns (bool upkeepNeeded, bytes memory performData)
   {
      uint256[] memory scheduleIdsToProcess = new uint256[](vestingSchedules.length);
      uint256 count = 0;

      for (uint256 i = 0; i < vestingSchedules.length; i++) {
         if (_isScheduleReadyForRelease(i)) {
            scheduleIdsToProcess[count] = i;
            count++;
         }
      }

      upkeepNeeded = count > 0;
      performData = abi.encode(scheduleIdsToProcess, count);

      return (upkeepNeeded, performData);
   }

   function performUpkeep(bytes calldata performData) external override {
      (uint256[] memory scheduleIds, uint256 count) = abi.decode(performData, (uint256[], uint256));

      for (uint256 i = 0; i < count; i++) {
         uint256 scheduleId = scheduleIds[i];
         if (_isScheduleReadyForRelease(scheduleId)) {
            _releaseTokens(scheduleId);
         }
      }
   }

   // Core Functions
   function createVestingSchedule(
      address _beneficiary,
      uint256 _totalAmount,
      uint256 _cliffDuration,
      uint256 _duration,
      ReleaseFrequency _frequency
   ) public onlyOwner nonReentrant whenNotPaused returns (uint256) {
      if (_beneficiary == address(0)) revert TokenVesting_InvalidInput();
      if (_totalAmount == 0) revert TokenVesting_InvalidInput();
      if (_cliffDuration == 0) revert TokenVesting_InvalidInput();
      if (_cliffDuration >= _duration) revert TokenVesting_InvalidInput();

      uint256 scheduleID = vestingSchedules.length;

      vestingSchedules.push(
         VestingSchedule({
            beneficiary: _beneficiary,
            totalAmount: _totalAmount,
            cliffDuration: _cliffDuration * 30 days,
            duration: _duration * 30 days,
            startTime: block.timestamp,
            releasedAmount: 0,
            revoked: false,
            releaseFrequency: _frequency
         })
      );

      beneficiaryVestingSchedules[_beneficiary].push(scheduleID);

      token.safeTransferFrom(msg.sender, address(this), _totalAmount);

      emit CreatedVestingSchedule(_beneficiary, scheduleID, _totalAmount, _cliffDuration);

      return scheduleID;
   }

   function release(uint256 _scheduleID) public nonReentrant whenNotPaused scheduleExists(_scheduleID) {
      _releaseTokens(_scheduleID);
   }

   function revoke(uint256 _scheduleID) public onlyOwner nonReentrant whenNotPaused scheduleExists(_scheduleID) {
      VestingSchedule storage schedule = vestingSchedules[_scheduleID];

      require(!schedule.revoked, "Schedule already revoked");

      uint256 remainingAmount = schedule.totalAmount - schedule.releasedAmount;
      schedule.revoked = true;

      if (remainingAmount > 0) {
         token.safeTransfer(owner(), remainingAmount);
      }

      emit ScheduleRevoked(_scheduleID, schedule.beneficiary, remainingAmount);
   }

   // Internal Functions
   function _releaseTokens(uint256 _scheduleID) internal {
      VestingSchedule storage schedule = vestingSchedules[_scheduleID];

      uint256 releasableAmount = _calculateReleasableAmount(_scheduleID);
      if (releasableAmount == 0) revert TokenVesting_NoTokensToRelease();

      schedule.releasedAmount += releasableAmount;
      token.safeTransfer(schedule.beneficiary, releasableAmount);

      emit TokensReleased(_scheduleID, schedule.beneficiary, releasableAmount);
   }

   /**
    * @notice Calculates the amount of tokens available for release for a given vesting schedule
    * @param _scheduleID ID of the vesting schedule
    * @return Amount of tokens available for release
    */
   function _calculateReleasableAmount(uint256 _scheduleID) internal view returns (uint256) {
      // Load the vesting schedule
      VestingSchedule memory schedule = vestingSchedules[_scheduleID];

      // Return 0 if still in cliff period
      if (block.timestamp <= schedule.startTime + schedule.cliffDuration) {
         return 0;
      }

      // Return remaining amount if vesting duration has completed
      if (block.timestamp >= schedule.startTime + schedule.duration) {
         return schedule.totalAmount - schedule.releasedAmount;
      }

      // Calculate time-based parameters
      uint256 timeFromStart = block.timestamp - schedule.startTime;
      uint256 releasePeriod = _getReleasePeriod(schedule.releaseFrequency);
      uint256 totalPeriods = schedule.duration / releasePeriod;
      uint256 remainingDays = schedule.duration % releasePeriod;
      uint256 completePeriods = timeFromStart / releasePeriod;
      uint256 daysIntoCurrentPeriod = timeFromStart % releasePeriod;

      // Calculate releasable tokens based on vesting formula
      uint256 releasableAmount;
      uint256 tokensForRemainingDays;

      if (remainingDays > 0) {
         // Calculate with remaining days consideration
         releasableAmount = (schedule.totalAmount * releasePeriod * completePeriods) / schedule.duration;
         tokensForRemainingDays = Math.ceilDiv((schedule.totalAmount * remainingDays), schedule.duration);
      } else {
         // Calculate for perfect period division
         releasableAmount = (schedule.totalAmount * completePeriods) / totalPeriods;
         tokensForRemainingDays = 0;
      }

      // Add remaining days tokens if in final period
      if (completePeriods == totalPeriods && daysIntoCurrentPeriod >= remainingDays) {
         releasableAmount += tokensForRemainingDays;
      }

      // Adjust for previously released tokens
      releasableAmount -= schedule.releasedAmount;

      schedule.releasedAmount += releasableAmount;

      return releasableAmount;
   }

   function _isScheduleReadyForRelease(uint256 _scheduleID) internal view returns (bool) {
      if (_scheduleID >= vestingSchedules.length) return false;

      VestingSchedule memory schedule = vestingSchedules[_scheduleID];

      return !schedule.revoked && block.timestamp > schedule.startTime + schedule.cliffDuration
         && schedule.releasedAmount < schedule.totalAmount && _calculateReleasableAmount(_scheduleID) > 0;
   }

   function _getReleasePeriod(ReleaseFrequency frequency) internal pure returns (uint256) {
      if (frequency == ReleaseFrequency.Monthly) {
         return 30 days;
      } else if (frequency == ReleaseFrequency.Quarterly) {
         return 90 days;
      } else if (frequency == ReleaseFrequency.Yearly) {
         return 365 days;
      }
      revert TokenVesting_InvalidFrequency();
   }

   // View Functions
   function getAllVestingSchedules() external view returns (VestingSchedule[] memory) {
      return vestingSchedules;
   }

   function getVestingScheduleDetails(uint256 _scheduleID)
      external
      view
      scheduleExists(_scheduleID)
      returns (VestingSchedule memory)
   {
      return vestingSchedules[_scheduleID];
   }

   function getBeneficiarySchedules(address _beneficiary) external view returns (uint256[] memory) {
      return beneficiaryVestingSchedules[_beneficiary];
   }

   function getNextReleaseAmount(uint256 _scheduleID) external view scheduleExists(_scheduleID) returns (uint256) {
      return _calculateReleasableAmount(_scheduleID);
   }

   // Admin Functions
   function pause() external onlyOwner {
      _pause();
   }

   function unpause() external onlyOwner {
      _unpause();
   }
}

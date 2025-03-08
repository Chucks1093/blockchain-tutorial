// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import { ERC677 } from "@chainlink/contracts/src/v0.8/shared/token/ERC677/ERC677.sol"; // Import the ERC677 interface

contract LocalAutomator {
   error LocalAutomator__UnAuthorisedAccess();
   error LocalAutomator__EthNotAccepted();

   event AutomationTriggered(uint256 timestamp, bool wasNeeded, uint256 gasUsed, uint256 feeCharged);
   event InsufficientFunds(uint256 available, uint256 required);
   event TokenReceived(uint256 amount, bytes data);

   AutomationCompatibleInterface public targetContract;
   uint256 public lastCheck;
   uint256 public interval;
   address public owner;
   bool public isRunning;
   address public feeCollector;
   uint256 public gasMultiplier;

   // The accepted LinkToken
   ERC677 public linkToken;

   constructor(
      address _targetContract,
      uint256 _interval,
      address _owner,
      address _linkTokenAddress,
      address _feeCollector,
      uint256 _gasMultiplier
   ) {
      targetContract = AutomationCompatibleInterface(_targetContract);
      interval = _interval > 0 ? _interval : 5 minutes;
      lastCheck = block.timestamp;
      owner = _owner;
      feeCollector = _feeCollector;
      isRunning = true;

      gasMultiplier = _gasMultiplier;

      require(_linkTokenAddress != address(0), "Invalid token address");
      linkToken = ERC677(_linkTokenAddress);
   }

   // Reject ETH transfers
   receive() external payable {
      revert LocalAutomator__EthNotAccepted();
   }

   fallback() external payable {
      revert LocalAutomator__EthNotAccepted();
   }

   modifier onlyOwner() {
      if (msg.sender != owner) revert LocalAutomator__UnAuthorisedAccess();
      _;
   }

   modifier onlyFeeCollector() {
      if (msg.sender != feeCollector) revert LocalAutomator__UnAuthorisedAccess();
      _;
   }

   // ERC677 handler - gets called when someone uses transferAndCall
   function onTokenTransfer(address, uint256 amount, bytes calldata data) external returns (bool) {
      // Ensure only the LINK token can call this function
      require(msg.sender == address(linkToken), "Only LINK token allowed");

      emit TokenReceived(amount, data);
      return true;
   }

   // Standard function to deposit LINK tokens via approve + transferFrom
   function depositToken(uint256 amount) external returns (bool) {
      bool success = linkToken.transferFrom(msg.sender, address(this), amount);
      require(success, "Token transfer failed");

      emit TokenReceived(amount, "");
      return true;
   }

   // Withdraw tokens
   function withdrawToken(uint256 amount) external onlyOwner {
      uint256 balance = linkToken.balanceOf(address(this));
      uint256 withdrawAmount = amount > 0 && amount <= balance ? amount : balance;

      bool success = linkToken.transfer(owner, withdrawAmount);
      require(success, "Token transfer failed");
   }

   function checkAndExecute(uint256 _gasEstimate) external returns (bool) {
      require(isRunning, "Automation stopped");
      require(block.timestamp >= lastCheck + interval, "Too early");

      // Pre-check for sufficient token balance
      uint256 estimatedFee = _gasEstimate * gasMultiplier / 100;
      uint256 tokenBalance = linkToken.balanceOf(address(this));

      if (tokenBalance < estimatedFee) {
         emit InsufficientFunds(tokenBalance, estimatedFee);
         return false;
      }

      uint256 startGas = gasleft();

      (bool needsUpkeep, bytes memory performData) = targetContract.checkUpkeep("");

      if (needsUpkeep) {
         targetContract.performUpkeep(performData);
      }

      lastCheck = block.timestamp;

      // Calculate and collect actual fee
      uint256 gasUsed = startGas - gasleft();
      uint256 feeAmount = (gasUsed * gasMultiplier) / 100;

      // Transfer token fee to collector
      if (feeAmount > 0 && tokenBalance >= feeAmount) {
         bool success = linkToken.transfer(feeCollector, feeAmount);
         require(success, "Fee transfer failed");
         emit AutomationTriggered(block.timestamp, needsUpkeep, gasUsed, feeAmount);
      } else {
         emit AutomationTriggered(block.timestamp, needsUpkeep, gasUsed, 0);
      }

      return needsUpkeep;
   }

   // Update interval (in seconds)
   function setInterval(uint256 _interval) external onlyOwner {
      require(_interval > 0, "Interval must be positive");
      interval = _interval;
   }

   // Pause automation
   function stopAutomation() external onlyOwner {
      isRunning = false;
   }

   // Resume automation
   function startAutomation() external onlyOwner {
      isRunning = true;
   }

   // Update target contract
   function setTargetContract(address _targetContract) external onlyOwner {
      require(_targetContract != address(0), "Invalid contract address");
      targetContract = AutomationCompatibleInterface(_targetContract);
   }
}

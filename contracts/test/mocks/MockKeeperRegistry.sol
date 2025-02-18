// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IAutomationRegistryConsumer } from
   "@chainlink/contracts/src/v0.8/automation/interfaces/IAutomationRegistryConsumer.sol";

import { LinkToken } from "@chainlink/contracts/src/v0.8/shared/token/ERC677/LinkToken.sol";

contract MockKeeperRegistry {
   error RegistrationNotFound();
   error InsufficientFunds();
   error UpkeepCancelled();
   error UpkeepNotNeeded();

   struct UpkeepInfo {
      address target;
      uint32 gasLimit;
      address admin;
      uint96 balance;
      bool active;
   }

   LinkToken public immutable i_link;
   mapping(uint256 => UpkeepInfo) public s_upkeeps;
   uint256 public s_nextUpkeepId;
   uint96 public s_minLinkBalance;

   event UpkeepRegistered(uint256 indexed id, uint32 gasLimit, address admin, address target);
   event UpkeepPerformed(uint256 indexed id, bool indexed success, address target, uint96 amountSpent);
   event UpkeepCanceled(uint256 indexed id, uint96 remainingBalance);
   event FundsAdded(uint256 indexed id, address indexed from, uint96 amount);
   event FundsWithdrawn(uint256 indexed id, uint96 amount, address to);

   constructor(uint96 _minLinkBalance) {
      // Deploy new LINK token if needed
      i_link = new LinkToken();
      s_minLinkBalance = _minLinkBalance;
   }

   function registerUpkeep(address target, uint32 gasLimit, address admin, bytes calldata /* checkData */ )
      external
      returns (uint256 upkeepId)
   {
      upkeepId = s_nextUpkeepId++;
      s_upkeeps[upkeepId] = UpkeepInfo({ target: target, gasLimit: gasLimit, admin: admin, balance: 0, active: true });

      emit UpkeepRegistered(upkeepId, gasLimit, admin, target);
   }

   function addFunds(uint256 id, uint96 amount) external {
      UpkeepInfo storage upkeep = s_upkeeps[id];
      if (upkeep.target == address(0)) revert RegistrationNotFound();

      upkeep.balance += amount;
      i_link.transferFrom(msg.sender, address(this), amount);

      emit FundsAdded(id, msg.sender, amount);
   }

   function cancelUpkeep(uint256 id) external {
      UpkeepInfo storage upkeep = s_upkeeps[id];
      if (upkeep.target == address(0)) revert RegistrationNotFound();
      if (msg.sender != upkeep.admin) revert();

      uint96 remainingBalance = upkeep.balance;
      upkeep.balance = 0;
      upkeep.active = false;

      i_link.transfer(msg.sender, remainingBalance);
      emit UpkeepCanceled(id, remainingBalance);
   }

   function checkUpkeep(uint256 id) external returns (bool upkeepNeeded, bytes memory performData) {
      UpkeepInfo storage upkeep = s_upkeeps[id];
      if (!upkeep.active) revert UpkeepCancelled();
      if (upkeep.balance < s_minLinkBalance) revert InsufficientFunds();

      // Call checkUpkeep on the target contract
      (bool success, bytes memory data) = upkeep.target.call(abi.encodeWithSignature("checkUpkeep(bytes)", ""));

      require(success, "Check failed");
      return abi.decode(data, (bool, bytes));
   }

   function performUpkeep(uint256 id, bytes calldata performData) external returns (bool success) {
      UpkeepInfo storage upkeep = s_upkeeps[id];
      if (!upkeep.active) revert UpkeepCancelled();
      if (upkeep.balance < s_minLinkBalance) revert InsufficientFunds();

      // Simulate LINK cost
      uint96 payment = s_minLinkBalance / 10;
      upkeep.balance -= payment;

      // Call performUpkeep on the target contract
      (success,) = upkeep.target.call(abi.encodeWithSignature("performUpkeep(bytes)", performData));

      emit UpkeepPerformed(id, success, upkeep.target, payment);
   }

   function getUpkeep(uint256 id) external view returns (UpkeepInfo memory) {
      return s_upkeeps[id];
   }

   function getBalance(uint256 id) external view returns (uint96) {
      return s_upkeeps[id].balance;
   }

   function withdrawFunds(uint256 id, address to) external {
      UpkeepInfo storage upkeep = s_upkeeps[id];
      if (msg.sender != upkeep.admin) revert();

      uint96 balance = upkeep.balance;
      upkeep.balance = 0;

      i_link.transfer(to, balance);
      emit FundsWithdrawn(id, balance, to);
   }
}

// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Test, console } from "forge-std/Test.sol";

import { MultiSignatureWallet } from "@simple-tasks/MultiSignatureWallet.sol";

contract MultiSignatureWalletTest is Test {
   address[] public owners;
   address public owner1;
   address public owner2;
   address public owner3;
   address public ordinaryUser;
   MultiSignatureWallet multisignatureWallet;
   uint256 amount = 1 ether;

   function setUp() public {
      owner1 = makeAddr("owner1");
      owner2 = makeAddr("owner2");
      owner3 = makeAddr("owner3");
      ordinaryUser = makeAddr("ordinaryUser");
      owners.push(owner1);
      owners.push(owner2);
      owners.push(owner3);
      multisignatureWallet = new MultiSignatureWallet(owners, owners.length);
      vm.deal(address(multisignatureWallet), 200 ether);
   }

   receive() external payable { }

   function testsubmitTransaction() public {
      vm.startPrank(owner1);
      multisignatureWallet.submitTransaction(ordinaryUser, amount, "Treasury");
      multisignatureWallet.submitTransaction(ordinaryUser, amount, "Treasury");
      MultiSignatureWallet.Transaction[] memory transactions = multisignatureWallet.getUserTransactions();
      assertEq(transactions[1].txIndex, 1);
   }

   function testConfirmTransaction() public {
      vm.prank(ordinaryUser);
      MultiSignatureWallet.Transaction memory firstTx =
         multisignatureWallet.submitTransaction(owner2, amount, "Treasury");

      vm.prank(owner2);
      multisignatureWallet.confirmTransaction(firstTx.txIndex, ordinaryUser);

      vm.prank(owner1);
      multisignatureWallet.confirmTransaction(firstTx.txIndex, ordinaryUser);

      vm.prank(ordinaryUser);
      MultiSignatureWallet.Transaction memory transaction =
         multisignatureWallet.getTransationDetails(firstTx.txIndex, ordinaryUser);

      assertEq(transaction.confirmations, 2);
   }

   function testExecuteTransactions() public {
      vm.prank(ordinaryUser);
      MultiSignatureWallet.Transaction memory transaction =
         multisignatureWallet.submitTransaction(owner2, amount, "Treasury");

      vm.prank(owner3);
      multisignatureWallet.confirmTransaction(transaction.txIndex, ordinaryUser);

      vm.prank(owner1);
      multisignatureWallet.confirmTransaction(transaction.txIndex, ordinaryUser);

      vm.prank(owner2);
      MultiSignatureWallet.Transaction memory executedTx =
         multisignatureWallet.confirmTransaction(transaction.txIndex, ordinaryUser);

      assertTrue(executedTx.executed);
   }

   function testRevokeTransaction() public {
      vm.prank(ordinaryUser);
      MultiSignatureWallet.Transaction memory transaction =
         multisignatureWallet.submitTransaction(owner2, amount, "Treasury");

      vm.prank(owner1);
      multisignatureWallet.confirmTransaction(transaction.txIndex, ordinaryUser);

      vm.prank(owner1);
      MultiSignatureWallet.Transaction memory revokedTx =
         multisignatureWallet.revokeTransaction(transaction.txIndex, ordinaryUser);

      assertEq(revokedTx.confirmations, 0);
   }

   function testAddNewOwner() public {
      vm.prank(owner2);
      multisignatureWallet.addNewOwner(ordinaryUser);
      assertEq(multisignatureWallet.getOwners().length, owners.length + 1);
   }

   function testRemoveOwner() public {
      vm.prank(owner1);
      multisignatureWallet.removeOwner(owner2);
      assertEq(multisignatureWallet.getOwners().length, owners.length - 1);
   }

   function testChangeRequiredSignatures() public {
      uint256 newSignature = multisignatureWallet.changeRequiredSignatures(3);
      assertEq(newSignature, multisignatureWallet.getRequiredSignatures());
   }

   function testProposeAdmin() public returns (MultiSignatureWallet.ProposedAdmin memory) {
      address newAdmin = makeAddr("newAdmin");
      vm.prank(owner1);
      address proposedAdmin = multisignatureWallet.proposeNewAdmin(newAdmin);

      assertEq(newAdmin, proposedAdmin);
      vm.prank(owner1);
      bool hasVoted = multisignatureWallet.checkHasVoted();
      assertTrue(hasVoted);
      vm.prank(owner1);
      MultiSignatureWallet.ProposedAdmin memory proposedAdminDetails = multisignatureWallet.getPropsedAdminDetails();
      assertEq(proposedAdminDetails.approvals, 1);
      assertTrue(proposedAdminDetails.isActive);
      return proposedAdminDetails;
   }

   function testApproveProposedAdmin() public {
      testProposeAdmin();
      vm.prank(owner2);
      multisignatureWallet.approveProposedAdmin();
      vm.prank(owner2);
      MultiSignatureWallet.ProposedAdmin memory proposedAdminDetails = multisignatureWallet.getPropsedAdminDetails();
      assertEq(proposedAdminDetails.approvals, 2);
   }

   function testDisapporveProposedAdmin() public {
      testProposeAdmin();
      vm.prank(owner2);
      multisignatureWallet.disApproveNewAdmin();
      vm.prank(owner2);
      MultiSignatureWallet.ProposedAdmin memory proposedAdminDetails = multisignatureWallet.getPropsedAdminDetails();
      assertEq(proposedAdminDetails.disapprovals, 1);
   }

   function testChangeAdmin() public {
      testProposeAdmin();
      vm.prank(owner2);
      multisignatureWallet.approveProposedAdmin();
      vm.prank(owner3);
      multisignatureWallet.approveProposedAdmin();

      vm.prank(owner1);
      MultiSignatureWallet.ProposedAdmin memory proposedAdminDetails = multisignatureWallet.getPropsedAdminDetails();

      address admin = multisignatureWallet.getCurrentAdminDetails();

      assertEq(proposedAdminDetails.newAdmin, admin);

      assertFalse(proposedAdminDetails.isActive);
   }

   function testGetUserTransactions() public {
      vm.startPrank(ordinaryUser);
      multisignatureWallet.submitTransaction(owner2, amount, "Treasury");
      multisignatureWallet.submitTransaction(owner2, amount, "Food");
      multisignatureWallet.submitTransaction(owner2, amount, "Cake");
      multisignatureWallet.submitTransaction(owner2, amount, "Party");
      MultiSignatureWallet.Transaction[] memory userTxns = multisignatureWallet.getUserTransactions();
      assertEq(userTxns.length, 4);

      vm.stopPrank();
      vm.startPrank(owner2);
      multisignatureWallet.submitTransaction(owner1, amount, "Simba");
      MultiSignatureWallet.Transaction[] memory ownerTxns = multisignatureWallet.getUserTransactions();
      assertEq(ownerTxns.length, 5);
   }
}

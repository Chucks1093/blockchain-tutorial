// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { SecretMessage } from "@simple-tasks/SecretMessage.sol";

contract SecretMessageTest is Test {
   address public alice;
   address public bob;
   address owner;

   string public constant INITIAL_QUOTE = "Initial Quote";
   string public constant TEST_MESSAGE = "Hello World";
   SecretMessage secretMessage;

   function setUp() public {
      alice = makeAddr("alice");
      bob = makeAddr("bob");
      owner = makeAddr("owner");
      secretMessage = new SecretMessage(INITIAL_QUOTE);
   }

   function testGeneralMessageAccess() public {
      vm.prank(alice);
      vm.expectRevert(SecretMessage.SecretMessage__UnauthorizedAccess.selector);
      secretMessage.setGeneralMessage(TEST_MESSAGE);
   }

   function testSendingMessage() public {
      vm.startPrank(alice);
      secretMessage.sendMessage(bob, TEST_MESSAGE);
      secretMessage.sendMessage(bob, TEST_MESSAGE);
      secretMessage.sendMessage(bob, TEST_MESSAGE);
      secretMessage.sendMessage(bob, TEST_MESSAGE);
      SecretMessage.MessageInfo[] memory sentMessages = secretMessage.getSentMessages();
      vm.stopPrank();
      console.log("Number of messages:", sentMessages.length);
      assertEq(sentMessages.length, 4);
      assertEq(sentMessages[0].content, TEST_MESSAGE);
      assertEq(sentMessages[0].recipient, bob);
   }

   function testReceivingMessage() public {
      vm.prank(alice);
      secretMessage.sendMessage(bob, TEST_MESSAGE);
      vm.startPrank(bob);
      SecretMessage.MessageInfo[] memory recievedMessages = secretMessage.getReceivedMessages();
      console.log("Number of messages:", recievedMessages.length);
      assertEq(recievedMessages.length, 1);
      assertEq(recievedMessages[0].content, TEST_MESSAGE);
      assertEq(recievedMessages[0].recipient, alice);
   }

   function testSendMessageEmitEvent() public {
      vm.expectEmit(true, true, false, true);

      emit SecretMessage.MessageSent(alice, bob, TEST_MESSAGE);

      vm.prank(alice);
      secretMessage.sendMessage(bob, TEST_MESSAGE);
   }

   function testFuzz_SendMessage(address _to, string memory _message) public {
      vm.assume(_to != address(0));
      vm.assume(bytes(_message).length > 0);
      console.log("Message generated :", _message);
      vm.startPrank(alice);
      secretMessage.sendMessage(bob, _message);

      SecretMessage.MessageInfo[] memory userSentMessages = secretMessage.getSentMessages();

      console.log("message length:", userSentMessages.length);
   }
}

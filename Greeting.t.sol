// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { SecretMessage } from "@simple-tasks/SecretMessage.sol";

contract SecretMessageTest is Test {
   SecretMessage public secretMessage;
   address public owner;
   address public alice;
   address public bob;
   string public constant INITIAL_QUOTE = "Initial Quote";
   string public constant TEST_MESSAGE = "Hello World";

   event MessageSent(address indexed from, address indexed to, string message);
   event MessageRead(address indexed from, address indexed to, uint256 timestamp);
   event MessageDeleted(address indexed from, address indexed to, bool deletedForAll);

   function setUp() public {
      owner = address(this);
      alice = makeAddr("alice");
      bob = makeAddr("bob");

      // Deploy contract
      secretMessage = new SecretMessage(INITIAL_QUOTE);

      // Fund test accounts
      vm.deal(alice, 100 ether);
      vm.deal(bob, 100 ether);
   }

   // Testing message sending
   function testSendMessage() public {
      vm.prank(alice);
      secretMessage.sendSecreatMessage(bob, TEST_MESSAGE);

      MessageInfo[] memory sentMessages = secretMessage.getSentMessages();
      assertEq(sentMessages.length, 1);
      assertEq(sentMessages[0].recipient, bob);
      assertEq(sentMessages[0].content, TEST_MESSAGE);
      assertEq(sentMessages[0].isRead, false);
   }

   function testSendMessageEmitsEvent() public {
      vm.prank(alice);
      vm.expectEmit(true, true, false, true);
      emit MessageSent(alice, bob, TEST_MESSAGE);
      secretMessage.sendSecreatMessage(bob, TEST_MESSAGE);
   }

   function testCannotSendEmptyMessage() public {
      vm.prank(alice);
      vm.expectRevert(SecretMessage.SecretMessage__EmptyMessage.selector);
      secretMessage.sendSecreatMessage(bob, "");
   }

   function testCannotSendMessageToZeroAddress() public {
      vm.prank(alice);
      vm.expectRevert(SecretMessage.SecretMessage__InvalidOperation.selector);
      secretMessage.sendSecreatMessage(address(0), TEST_MESSAGE);
   }

   // Testing message reading
   function testMarkMessageAsRead() public {
      // Alice sends message to Bob
      vm.prank(alice);
      secretMessage.sendSecreatMessage(bob, TEST_MESSAGE);

      // Bob reads message
      vm.prank(bob);
      secretMessage.markMessageAsRead(alice);

      // Check read status
      vm.prank(alice);
      (bool isRead,,,,) = secretMessage.getMessageStatus(bob);
      assertTrue(isRead);
   }

   function testCannotMarkMessageAsReadTwice() public {
      vm.prank(alice);
      secretMessage.sendSecreatMessage(bob, TEST_MESSAGE);

      vm.prank(bob);
      secretMessage.markMessageAsRead(alice);

      vm.prank(bob);
      vm.expectRevert(SecretMessage.SecretMessage__MessageAlreadyRead.selector);
      secretMessage.markMessageAsRead(alice);
   }

   // Testing message deletion
   function testDeleteMessage() public {
      vm.prank(alice);
      secretMessage.sendSecreatMessage(bob, TEST_MESSAGE);

      vm.prank(alice);
      secretMessage.deleteMessage(bob, false);

      MessageInfo[] memory messages = secretMessage.getSentMessages();
      assertTrue(messages[0].isDeleted);
      assertEq(messages[0].content, "");
   }

   function testDeleteMessageForAll() public {
      vm.prank(alice);
      secretMessage.sendSecreatMessage(bob, TEST_MESSAGE);

      vm.prank(alice);
      secretMessage.deleteMessage(bob, true);

      // Check Alice's view
      vm.prank(alice);
      MessageInfo[] memory sentMessages = secretMessage.getSentMessages();
      assertTrue(sentMessages[0].isDeleted);
      assertEq(sentMessages[0].content, "");

      // Check Bob's view
      vm.prank(bob);
      MessageInfo[] memory receivedMessages = secretMessage.getReceivedMessages();
      assertTrue(receivedMessages[0].isDeleted);
      assertEq(receivedMessages[0].content, "");
   }

   function testReceiverDeleteMessage() public {
      vm.prank(alice);
      secretMessage.sendSecreatMessage(bob, TEST_MESSAGE);

      vm.prank(bob);
      secretMessage.deleteReceivedMessage(alice);

      vm.prank(bob);
      MessageInfo[] memory messages = secretMessage.getReceivedMessages();
      assertTrue(messages[0].isDeleted);
      assertEq(messages[0].content, "");
   }

   // Testing message retrieval
   function testGetSentMessages() public {
      // Alice sends multiple messages
      vm.startPrank(alice);
      secretMessage.sendSecreatMessage(bob, "Message 1");
      secretMessage.sendSecreatMessage(bob, "Message 2");
      vm.stopPrank();

      vm.prank(alice);
      MessageInfo[] memory messages = secretMessage.getSentMessages();

      assertEq(messages.length, 2);
      assertEq(messages[0].content, "Message 1");
      assertEq(messages[1].content, "Message 2");
   }

   function testGetReceivedMessages() public {
      // Multiple senders send messages to Bob
      vm.prank(alice);
      secretMessage.sendSecreatMessage(bob, "From Alice");

      vm.prank(owner);
      secretMessage.sendSecreatMessage(bob, "From Owner");

      vm.prank(bob);
      MessageInfo[] memory messages = secretMessage.getReceivedMessages();

      assertEq(messages.length, 2);
      // Check that messages are received correctly
      bool hasAliceMessage = false;
      bool hasOwnerMessage = false;

      for (uint256 i = 0; i < messages.length; i++) {
         if (messages[i].recipient == alice) {
            assertEq(messages[i].content, "From Alice");
            hasAliceMessage = true;
         } else if (messages[i].recipient == owner) {
            assertEq(messages[i].content, "From Owner");
            hasOwnerMessage = true;
         }
      }

      assertTrue(hasAliceMessage && hasOwnerMessage);
   }

   // Testing quote functionality
   function testSetQuote() public {
      string memory newQuote = "New Quote";
      secretMessage.setQuote(newQuote);
      assertEq(secretMessage.getSecretMessage(), newQuote);
   }

   function testCannotSetQuoteIfNotOwner() public {
      vm.prank(alice);
      vm.expectRevert(SecretMessage.SecretMessage__UnauthorisedAccess.selector);
      secretMessage.setQuote("Unauthorized Quote");
   }

   // Fuzz testing
   function testFuzz_SendMessage(address _to, string calldata _message) public {
      vm.assume(_to != address(0));
      vm.assume(bytes(_message).length > 0);

      vm.prank(alice);
      secretMessage.sendSecreatMessage(_to, _message);

      MessageInfo[] memory messages = secretMessage.getSentMessages();
      assertEq(messages[0].recipient, _to);
      assertEq(messages[0].content, _message);
   }
}

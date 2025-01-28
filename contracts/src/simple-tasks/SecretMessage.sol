// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title SecretMessage
 * @notice A contract for users to send and receive secret messages
 * @dev This contract is a simple example of a messaging system. It allows users to send messages to each other, and keep track of
 * all messages sent by a user. The contract also stores a single public message that can be set by the owner.
 */
contract SecretMessage {
   error SecretMessage__UnauthorizedAccess();
   error SecretMessage__EmptyMessage();
   error SecretMessage__InvalidRecipient();

   struct MessageInfo {
      string content;
      address recipient;
      uint256 timestamp;
   }

   // Sender
   mapping(address => MessageInfo[]) public sentMessages;

   // Reciever
   mapping(address => MessageInfo[]) public receivedMessages;

   address private owner;
   string public generalMessage;

   event SecretMessageSet(address indexed _owner, string _newMessage);
   event MessageSent(address indexed from, address indexed to, string message); // Added event for message sending

   constructor(string memory _initialMessage) {
      owner = msg.sender;
      generalMessage = _initialMessage;
   }

   function sendMessage(address _to, string memory _message) public {
      if (_to == address(0)) revert SecretMessage__InvalidRecipient();
      if (bytes(_message).length == 0) revert SecretMessage__EmptyMessage();

      sentMessages[msg.sender].push(MessageInfo({ content: _message, recipient: _to, timestamp: block.timestamp }));

      receivedMessages[_to].push(
         MessageInfo({
            content: _message,
            recipient: msg.sender, // Note: This is the sender from recipient's perspective,
            timestamp: block.timestamp
         })
      );

      emit MessageSent(msg.sender, _to, _message); // Emit event when message is sent
   }

   function getSentMessages() public view returns (MessageInfo[] memory) {
      return sentMessages[msg.sender];
   }

   function getReceivedMessages() public view returns (MessageInfo[] memory) {
      return receivedMessages[msg.sender];
   }

   function setGeneralMessage(string memory _newMessage) public {
      if (msg.sender != owner) revert SecretMessage__UnauthorizedAccess();
      generalMessage = _newMessage;
      emit SecretMessageSet(owner, _newMessage);
   }

   function getGeneralMessage() public view returns (string memory) {
      return generalMessage;
   }
}

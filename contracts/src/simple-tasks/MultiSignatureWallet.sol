// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

/**
 * @title Multi-Signature Wallet
 * @dev A wallet that requires multiple signatures to approve a transaction
 */
contract MultiSignatureWallet {
   error MultiSignatureWallet__OwnerExists();
   error MultiSignatureWallet__UnAuthorisedAccess();
   error MultiSignatureWallet__OwnerDoesNotExist(address owner);
   error MultiSignatureWallet__ExceededMaximumConfirmations(uint256 confirmations);
   error MultiSignatureWallet__InvalidInput();
   error MultiSignatureWallet__AlreadyConfirmed();

   struct Transaction {
      bytes32 txHash;
      uint256 txIndex;
      address from;
      address to;
      uint256 amount;
      bytes data;
      bool executed;
      uint256 confirmations;
      uint256 timestamp;
   }

   struct Owner {
      address owner;
      bytes32 lastConfirmedTx; //real time
      uint256 activeSince; // real time
   }

   uint256 public CONFIRMATIIONS = 2;
   uint256 private _txCounter;

   mapping(address => Transaction[]) public transactions;
   mapping(bytes32 => mapping(address => bool)) public confirmedTransactions;

   address[] public owners;
   mapping(address => uint256) private ownerIndex;
   mapping(address => bool) isOwner;

   constructor(address[] memory _owners) {
      require(_owners.length > 0, "Owners required");
      for (uint256 i = 0; i < _owners.length; i++) {
         require(_owners[i] != address(0), "Invalid owner");
         isOwner[_owners[i]] = true;
         ownerIndex[_owners[i]] = owners.length;
         owners.push(_owners[i]);
      }
   }

   receive() external payable { }

   modifier onlyOwner() {
      if (!isOwner[msg.sender]) {
         revert MultiSignatureWallet__UnAuthorisedAccess();
      }
      _;
   }

   function generateTxId() private returns (bytes32) {
      uint256 id = _txCounter++;
      return bytes32((uint256(uint160(msg.sender)) << 96) | id);
   }

   function submitTransaction(address _to, uint256 _amount, bytes memory _data) public returns (Transaction memory) {
      bytes32 _txHash = generateTxId();
      Transaction[] storage userTx = transactions[msg.sender];
      Transaction memory newTransaction = Transaction({
         txHash: _txHash,
         txIndex: userTx.length,
         from: msg.sender,
         to: _to,
         amount: _amount,
         executed: false,
         data: _data,
         timestamp: block.timestamp,
         confirmations: 0
      });

      userTx.push(newTransaction);
      return newTransaction;
   }

   function executeTransaction(uint256 _txIndex, address _from) public {
      Transaction storage transaction = transactions[_from][_txIndex];
      if (CONFIRMATIIONS < transaction.confirmations) revert MultiSignatureWallet__UnAuthorisedAccess();
      require(!transaction.executed, "Already Executed");
      transaction.executed = true;
      (bool success,) = msg.sender.call{ value: transaction.amount }(transaction.data);
      require(success, "tx failed");
   }

   function confirmTransaction(uint256 _txIndex, address _from) public onlyOwner returns (Transaction memory) {
      Transaction storage transaction = transactions[_from][_txIndex];
      if (confirmedTransactions[transaction.txHash][msg.sender]) revert MultiSignatureWallet__AlreadyConfirmed();
      transaction.confirmations += 1;
      confirmedTransactions[transaction.txHash][msg.sender] = true;
      if (transaction.confirmations == CONFIRMATIIONS) {
         executeTransaction(_txIndex, _from);
      }
      return transaction;
   }

   function revokeTransaction(uint256 _txIndex, address _from) public onlyOwner returns (Transaction memory) {
      Transaction storage transaction = transactions[_from][_txIndex];
      bool hasPreviouslyConfirmed = confirmedTransactions[transaction.txHash][msg.sender];
      if (!hasPreviouslyConfirmed) revert MultiSignatureWallet__UnAuthorisedAccess();
      transaction.confirmations -= 1;
      hasPreviouslyConfirmed = false;
      return transaction;
   }

   function addNewOwner(address _newOwner) public onlyOwner returns (uint256) {
      if (_newOwner == address(0)) revert MultiSignatureWallet__InvalidInput();
      if (isOwner[_newOwner]) {
         revert MultiSignatureWallet__OwnerExists();
      }
      isOwner[_newOwner] = true;
      ownerIndex[_newOwner] = owners.length;
      owners.push(_newOwner);
      return ownerIndex[_newOwner];
   }

   function removeOwner(address _owner) public onlyOwner {
      if (_owner == address(0)) revert MultiSignatureWallet__InvalidInput();
      if (owners.length < CONFIRMATIIONS) revert MultiSignatureWallet__ExceededMaximumConfirmations(CONFIRMATIIONS);
      if (!isOwner[_owner]) {
         revert MultiSignatureWallet__OwnerDoesNotExist(_owner);
      }
      uint256 index = ownerIndex[_owner];
      uint256 lastIndex = owners.length - 1;

      if (index != lastIndex) {
         address lastOwner = owners[lastIndex];
         owners[index] = lastOwner;
         ownerIndex[lastOwner] = index;
      }
      owners.pop();
      delete ownerIndex[_owner];
      isOwner[_owner] = false;
   }

   function getUserTransactions() public view returns (Transaction[] memory) {
      return transactions[msg.sender];
   }

   function getTransationDetails(uint256 _txIndex) public view returns (Transaction memory) {
      return transactions[msg.sender][_txIndex];
   }

   function getBalace() public view onlyOwner returns (uint256) {
      return address(this).balance;
   }

   function checkIsOwner(address _owner) public view returns (bool) {
      return isOwner[_owner];
   }

   function getOwners() public view returns (address[] memory) {
      return owners;
   }
}

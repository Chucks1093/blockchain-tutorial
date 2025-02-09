// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title Multi-Signature Wallet
 * @dev A wallet that requires multiple signatures to approve a transaction
 */
contract MultiSignatureWallet {
   // Custom Errors
   error MultiSignatureWallet__OwnerExists();
   error MultiSignatureWallet__UnAuthorisedAccess();
   error MultiSignatureWallet__OwnerDoesNotExist(address owner);
   error MultiSignatureWallet__ExceededMaximumConfirmations(uint256 confirmations);
   error MultiSignatureWallet__InvalidInput();
   error MultiSignatureWallet__AlreadyConfirmed();

   // Events
   event TransactionConfrimed(uint256 indexed txIndex, bytes32 indexed txHash, address indexed owner);
   event TransactionSubmitted(
      uint256 indexed txIndex, address indexed from, address indexed to, uint256 amount, bytes data
   );
   event TransactionRevoked(uint256 indexed txIndex, bytes32 indexed txHash, address indexed owner);
   event TransactionExecuted(uint256 indexed txIndex, bytes32 indexed txHash);
   event OwnerAdded(address indexed owner, uint256 indexed ownerIndex);
   event OwnerRemoved(address indexed owner);
   //
   event AdminChangeProposed(address indexed proposer, address indexed newAdmin);
   event AdminChangeApproved(address indexed oldAdmin, address indexed newAdmin);
   event AdminChangeDisapproved(address indexed oldAdmin, address indexed newAdmin);
   event VotedAdminChange(address indexed owner);

   // Structs
   struct Transaction {
      bytes32 txHash;
      uint256 txIndex;
      address from;
      address to;
      uint256 amount;
      bytes data;
      bool executed;
      uint256 confirmations;
      address[] confirmers;
      uint256 timestamp;
   }

   struct ProposedAdmin {
      address newAdmin;
      uint256 approvals;
      uint256 disapprovals;
      bool isActive;
   }

   // State Variables
   uint256 public REQUIRED_SIGNATURES;
   address public ADMIN;
   ProposedAdmin public proposedAdmin;
   uint256 public adminChangeConfirmations;
   uint256 private _txCounter;
   address[] public transactionAddresses;

   // Mappings
   mapping(address => uint256) public addressToIndex;
   mapping(address => Transaction[]) public transactions;
   mapping(bytes32 => mapping(address => bool)) public confirmedTransactions;
   mapping(address => uint256) private ownerIndex;
   mapping(address => bool) isOwner;
   mapping(address => bool) hasVotedForAdmin;

   // Arrays
   address[] public owners;

   // Constructor
   constructor(address[] memory _owners, uint256 _signatures) {
      require(_owners.length > 0, "Owners required");
      for (uint256 i = 0; i < _owners.length; i++) {
         require(_owners[i] != address(0), "Invalid owner");
         isOwner[_owners[i]] = true;
         ownerIndex[_owners[i]] = owners.length;
         owners.push(_owners[i]);
      }
      REQUIRED_SIGNATURES = _signatures;
      ADMIN = msg.sender;
   }

   // Receive Function
   receive() external payable { }

   // Modifiers
   modifier onlyOwner() {
      if (!isOwner[msg.sender]) {
         revert MultiSignatureWallet__UnAuthorisedAccess();
      }
      _;
   }

   // External/Public Functions - Write
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
         confirmations: 0,
         confirmers: new address[](0)
      });

      if (transactions[msg.sender].length == 0) {
         transactionAddresses.push(msg.sender);
         addressToIndex[msg.sender] = transactionAddresses.length;
      }

      userTx.push(newTransaction);
      emit TransactionSubmitted(newTransaction.txIndex, msg.sender, _to, _amount, _data);
      return newTransaction;
   }

   function executeTransaction(uint256 _txIndex, address _from) public returns (uint256) {
      Transaction storage transaction = transactions[_from][_txIndex];
      if (transaction.confirmations != REQUIRED_SIGNATURES) revert MultiSignatureWallet__UnAuthorisedAccess();
      require(!transaction.executed, "Already Executed");
      transaction.executed = true;

      (bool success,) = transaction.to.call{ value: transaction.amount }(transaction.data);
      require(success, "tx failed");

      emit TransactionExecuted(transaction.txIndex, transaction.txHash);

      return _txIndex;
   }

   function confirmTransaction(uint256 _txIndex, address _from) public onlyOwner returns (Transaction memory) {
      Transaction storage transaction = transactions[_from][_txIndex];
      if (confirmedTransactions[transaction.txHash][msg.sender]) revert MultiSignatureWallet__AlreadyConfirmed();

      transaction.confirmations += 1;
      confirmedTransactions[transaction.txHash][msg.sender] = true;

      if (transaction.confirmations == REQUIRED_SIGNATURES) {
         executeTransaction(_txIndex, _from);
      }

      emit TransactionConfrimed(transaction.txIndex, transaction.txHash, msg.sender);

      return transaction;
   }

   function revokeTransaction(uint256 _txIndex, address _from) public onlyOwner returns (Transaction memory) {
      Transaction storage transaction = transactions[_from][_txIndex];

      bool hasPreviouslyConfirmed = confirmedTransactions[transaction.txHash][msg.sender];

      if (!hasPreviouslyConfirmed) revert MultiSignatureWallet__UnAuthorisedAccess();

      emit TransactionRevoked(transaction.txIndex, transaction.txHash, msg.sender);

      transaction.confirmations -= 1;
      confirmedTransactions[transaction.txHash][msg.sender] = false;

      return transaction;
   }

   function addNewOwner(address _newOwner) public onlyOwner returns (uint256) {
      if (_newOwner == address(0)) revert MultiSignatureWallet__InvalidInput();
      if (isOwner[_newOwner]) revert MultiSignatureWallet__OwnerExists();
      require(proposedAdmin.newAdmin == address(0), "New Admin been propsed");

      emit OwnerAdded(_newOwner, owners.length);

      isOwner[_newOwner] = true;
      ownerIndex[_newOwner] = owners.length;
      owners.push(_newOwner);

      return ownerIndex[_newOwner];
   }

   function removeOwner(address _owner) public onlyOwner {
      if (_owner == address(0)) revert MultiSignatureWallet__InvalidInput();
      if (owners.length < REQUIRED_SIGNATURES) {
         revert MultiSignatureWallet__ExceededMaximumConfirmations(REQUIRED_SIGNATURES);
      }
      if (!isOwner[_owner]) revert MultiSignatureWallet__OwnerDoesNotExist(_owner);
      require(proposedAdmin.newAdmin == address(0), "New Admin been propsed");

      uint256 index = ownerIndex[_owner];
      uint256 lastIndex = owners.length - 1;

      if (index != lastIndex) {
         address lastOwner = owners[lastIndex];
         owners[index] = lastOwner;
         ownerIndex[lastOwner] = index;
      }

      emit OwnerRemoved(_owner);

      owners.pop();
      delete ownerIndex[_owner];
      isOwner[_owner] = false;
   }

   function proposeNewAdmin(address _newAdmin) public onlyOwner returns (address) {
      if (_newAdmin == address(0)) revert MultiSignatureWallet__InvalidInput();
      if (_newAdmin == ADMIN) revert MultiSignatureWallet__InvalidInput();

      // Reset the proposal
      proposedAdmin = ProposedAdmin({ newAdmin: _newAdmin, approvals: 1, disapprovals: 0, isActive: true });

      hasVotedForAdmin[msg.sender] = true;

      emit AdminChangeApproved(msg.sender, _newAdmin);
      return proposedAdmin.newAdmin;
   }

   function approveProposedAdmin() public onlyOwner returns (ProposedAdmin memory) {
      if (!proposedAdmin.isActive) revert MultiSignatureWallet__InvalidInput();
      if (hasVotedForAdmin[msg.sender]) revert MultiSignatureWallet__InvalidInput();

      proposedAdmin.approvals += 1;
      hasVotedForAdmin[msg.sender] = true;
      emit VotedAdminChange(msg.sender);

      _checkAndFinalizeAdminChange();

      return proposedAdmin;
   }

   function disApproveNewAdmin() public onlyOwner {
      if (!proposedAdmin.isActive) revert MultiSignatureWallet__InvalidInput();
      if (hasVotedForAdmin[msg.sender]) revert MultiSignatureWallet__InvalidInput();

      proposedAdmin.disapprovals += 1;
      hasVotedForAdmin[msg.sender] = true;
      emit VotedAdminChange(msg.sender);

      _checkAndFinalizeAdminChange();
   }

   function changeRequiredSignatures(uint256 _confirmations) public returns (uint256) {
      if (msg.sender != ADMIN) revert();
      require(_confirmations <= owners.length, "Signatures higher than owners");
      REQUIRED_SIGNATURES = _confirmations;
      return REQUIRED_SIGNATURES;
   }

   // External/Public Functions - View/Pure
   function getUserTransactions() public view returns (Transaction[] memory) {
      if (isOwner[msg.sender]) {
         uint256 totalTxnsCount = 0;
         for (uint256 i = 0; i < transactionAddresses.length; i++) {
            totalTxnsCount += transactions[transactionAddresses[i]].length;
         }

         Transaction[] memory allUsersTxns = new Transaction[](totalTxnsCount);
         uint256 arrayIndex = 0;
         uint256 currentAddress = 0;
         uint256 txIndex = 0;

         while (arrayIndex < totalTxnsCount) {
            Transaction[] storage userTxns = transactions[transactionAddresses[currentAddress]];

            if (txIndex < userTxns.length) {
               allUsersTxns[arrayIndex] = userTxns[txIndex];
               txIndex++;
               arrayIndex++;
            } else {
               currentAddress++;
               txIndex = 0;
            }
         }
         return allUsersTxns;
      }
      return transactions[msg.sender];
   }

   function getTransationDetails(uint256 _txIndex, address _from) public view returns (Transaction memory) {
      if (isOwner[msg.sender]) {
         return transactions[_from][_txIndex];
      }
      return transactions[msg.sender][_txIndex];
   }

   function getBalace() public view returns (uint256) {
      return address(this).balance;
   }

   function checkIsOwner(address _owner) public view returns (bool) {
      return isOwner[_owner];
   }

   function getOwners() public view returns (address[] memory) {
      return owners;
   }

   function getRequiredSignatures() public view returns (uint256) {
      return REQUIRED_SIGNATURES;
   }

   function getPropsedAdminDetails() public view onlyOwner returns (ProposedAdmin memory) {
      return proposedAdmin;
   }

   function getCurrentAdminDetails() public view returns (address) {
      return ADMIN;
   }

   function checkHasVoted() public view returns (bool) {
      return hasVotedForAdmin[msg.sender];
   }

   // Private/Internal Functions
   function _checkAndFinalizeAdminChange() private {
      uint256 totalVotes = proposedAdmin.approvals + proposedAdmin.disapprovals;

      if (owners.length == totalVotes) {
         address oldAdmin = ADMIN;

         if (proposedAdmin.approvals > proposedAdmin.disapprovals) {
            emit AdminChangeApproved(oldAdmin, proposedAdmin.newAdmin);

            ADMIN = proposedAdmin.newAdmin;
         }

         if (proposedAdmin.disapprovals > proposedAdmin.approvals) {
            emit AdminChangeDisapproved(oldAdmin, proposedAdmin.newAdmin);
         }

         proposedAdmin.isActive = false;
      }
   }

   function generateTxId() private returns (bytes32) {
      uint256 id = _txCounter++;
      return bytes32((uint256(uint160(msg.sender)) << 96) | id);
   }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Multi-Signature Wallet
 * @dev A wallet that requires multiple signatures to approve transactions
 */
contract MultiSigWallet {
    // Events
    event Deposit(address indexed sender, uint256 amount);
    event SubmitTransaction(
        address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint256 required);

    // State Variables
    mapping(address => bool) public isOwner;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    address[] public owners;
    uint256 public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    Transaction[] public transactions;

    // Modifiers
    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    /**
     * @dev Contract constructor
     * @param _owners Array of owner addresses
     * @param _numConfirmationsRequired Number of required confirmations
     */
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    /**
     * @dev Allows the contract to receive Ether
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Submit a new transaction
     * @param _to Recipient address
     * @param _value Transaction value in wei
     * @param _data Transaction data
     * @return Transaction index
     */
    function submitTransaction(address _to, uint256 _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 txIndex = transactions.length;

        transactions.push(Transaction({to: _to, value: _value, data: _data, executed: false, numConfirmations: 0}));

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
        return txIndex;
    }

    /**
     * @dev Confirm a pending transaction
     * @param _txIndex Transaction index
     */
    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev Execute a confirmed transaction
     * @param _txIndex Transaction index
     */
    function executeTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];

        require(transaction.numConfirmations >= numConfirmationsRequired, "cannot execute tx");

        transaction.executed = true;

        (bool success,) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev Revoke a confirmation for a transaction
     * @param _txIndex Transaction index
     */
    function revokeConfirmation(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    /**
     * @dev Add a new owner
     * @param _owner Address of new owner
     */
    function addOwner(address _owner) public onlyOwner {
        require(_owner != address(0), "invalid owner");
        require(!isOwner[_owner], "owner exists");

        isOwner[_owner] = true;
        owners.push(_owner);

        emit OwnerAddition(_owner);
    }

    /**
     * @dev Remove an existing owner
     * @param _owner Address of owner to remove
     */
    function removeOwner(address _owner) public onlyOwner {
        require(isOwner[_owner], "not owner");
        require(owners.length - 1 >= numConfirmationsRequired, "cannot have less owners than required confirmations");

        isOwner[_owner] = false;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == _owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        emit OwnerRemoval(_owner);
    }

    /**
     * @dev Change the number of required confirmations
     * @param _required New number of required confirmations
     */
    function changeRequirement(uint256 _required) public onlyOwner {
        require(_required > 0, "invalid requirement");
        require(_required <= owners.length, "cannot require more confirmations than owners");

        numConfirmationsRequired = _required;

        emit RequirementChange(_required);
    }

    // View Functions

    /**
     * @dev Get list of owners
     * @return Array of owner addresses
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    /**
     * @dev Get transaction count
     * @return Number of transactions
     */
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    /**
     * @dev Get transaction details
     * @param _txIndex Transaction index
     * @return Transaction details
     */
    function getTransaction(uint256 _txIndex)
        public
        view
        returns (address to, uint256 value, bytes memory data, bool executed, uint256 numConfirmations)
    {
        Transaction storage transaction = transactions[_txIndex];

        return (transaction.to, transaction.value, transaction.data, transaction.executed, transaction.numConfirmations);
    }

    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/MultiSigWallet.sol";

contract MultiSigWalletTest is Test {
    MultiSigWallet public wallet;

    address[] public owners;
    address public owner1;
    address public owner2;
    address public owner3;
    address public nonOwner;

    uint256 public constant REQUIRED_CONFIRMATIONS = 2;

    function setUp() public {
        // Create test addresses
        owner1 = makeAddr("owner1");
        owner2 = makeAddr("owner2");
        owner3 = makeAddr("owner3");
        nonOwner = makeAddr("nonOwner");

        // Setup owners array
        owners = new address[](3);
        owners[0] = owner1;
        owners[1] = owner2;
        owners[2] = owner3;

        // Deploy wallet
        wallet = new MultiSigWallet(owners, REQUIRED_CONFIRMATIONS);

        // Fund wallet with initial balance
        vm.deal(address(wallet), 10 ether);
    }

    function testInitialSetup() public {
        assertEq(wallet.numConfirmationsRequired(), REQUIRED_CONFIRMATIONS);
        assertTrue(wallet.isOwner(owner1));
        assertTrue(wallet.isOwner(owner2));
        assertTrue(wallet.isOwner(owner3));
        assertFalse(wallet.isOwner(nonOwner));
        assertEq(wallet.getBalance(), 10 ether);
    }

    function testSubmitTransaction() public {
        vm.startPrank(owner1);

        uint256 txIndex = wallet.submitTransaction(address(0x123), 1 ether, "");

        (address to, uint256 value, bytes memory data, bool executed, uint256 numConfirmations) =
            wallet.getTransaction(txIndex);

        assertEq(to, address(0x123));
        assertEq(value, 1 ether);
        assertEq(data, "");
        assertFalse(executed);
        assertEq(numConfirmations, 0);

        vm.stopPrank();
    }

    function testConfirmTransaction() public {
        // Submit transaction
        vm.prank(owner1);
        uint256 txIndex = wallet.submitTransaction(address(0x123), 1 ether, "");

        // First confirmation
        vm.prank(owner1);
        wallet.confirmTransaction(txIndex);
        assertEq(wallet.getTransaction(txIndex).numConfirmations, 1);

        // Second confirmation
        vm.prank(owner2);
        wallet.confirmTransaction(txIndex);
        assertEq(wallet.getTransaction(txIndex).numConfirmations, 2);
    }

    function testExecuteTransaction() public {
        address recipient = makeAddr("recipient");
        uint256 initialBalance = address(recipient).balance;

        // Submit transaction
        vm.prank(owner1);
        uint256 txIndex = wallet.submitTransaction(recipient, 1 ether, "");

        // Confirm by owner1
        vm.prank(owner1);
        wallet.confirmTransaction(txIndex);

        // Confirm by owner2
        vm.prank(owner2);
        wallet.confirmTransaction(txIndex);

        // Execute
        vm.prank(owner1);
        wallet.executeTransaction(txIndex);

        // Verify
        (,,, bool executed,) = wallet.getTransaction(txIndex);
        assertTrue(executed);
        assertEq(address(recipient).balance, initialBalance + 1 ether);
    }

    function testRevokeConfirmation() public {
        // Submit transaction
        vm.prank(owner1);
        uint256 txIndex = wallet.submitTransaction(address(0x123), 1 ether, "");

        // Confirm transaction
        vm.prank(owner1);
        wallet.confirmTransaction(txIndex);
        assertEq(wallet.getTransaction(txIndex).numConfirmations, 1);

        // Revoke confirmation
        vm.prank(owner1);
        wallet.revokeConfirmation(txIndex);
        assertEq(wallet.getTransaction(txIndex).numConfirmations, 0);
    }

    function testAddOwner() public {
        address newOwner = makeAddr("newOwner");

        vm.prank(owner1);
        wallet.addOwner(newOwner);

        assertTrue(wallet.isOwner(newOwner));
        assertEq(wallet.getOwners().length, 4);
    }

    function testRemoveOwner() public {
        vm.prank(owner1);
        wallet.removeOwner(owner3);

        assertFalse(wallet.isOwner(owner3));
        assertEq(wallet.getOwners().length, 2);
    }

    function testChangeRequirement() public {
        vm.prank(owner1);
        wallet.changeRequirement(3);

        assertEq(wallet.numConfirmationsRequired(), 3);
    }

    function testFailNonOwnerSubmit() public {
        vm.prank(nonOwner);
        wallet.submitTransaction(address(0x123), 1 ether, "");
    }

    function testFailDoubleConfirmation() public {
        // Submit transaction
        vm.prank(owner1);
        uint256 txIndex = wallet.submitTransaction(address(0x123), 1 ether, "");

        // Confirm once
        vm.prank(owner1);
        wallet.confirmTransaction(txIndex);

        // Try to confirm again
        vm.prank(owner1);
        vm.expectRevert("tx already confirmed");
        wallet.confirmTransaction(txIndex);
    }

    function testFailExecuteWithoutEnoughConfirmations() public {
        // Submit transaction
        vm.prank(owner1);
        uint256 txIndex = wallet.submitTransaction(address(0x123), 1 ether, "");

        // Only one confirmation
        vm.prank(owner1);
        wallet.confirmTransaction(txIndex);

        // Try to execute
        vm.prank(owner1);
        vm.expectRevert("cannot execute tx");
        wallet.executeTransaction(txIndex);
    }

    function testReceiveEther() public {
        uint256 initialBalance = wallet.getBalance();
        payable(address(wallet)).transfer(1 ether);
        assertEq(wallet.getBalance(), initialBalance + 1 ether);
    }
}

Let me explain the error and memory types in Solidity:

Your error occurs because `push` can only be used with storage arrays, not memory arrays. Here's the fixed version:

```solidity
function submitTransaction(address _to, uint256 _amount, bytes memory _data) public {
    bytes32 _txHash = generateTxId();
    // Change to storage
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
}
```

Now let's break down the three data location types:

1. Storage:
   - Persistent data stored on the blockchain
   - Most expensive for gas
   - Can be modified
   - Keeps data between function calls
   - Use when: You need to modify state variables or need data persistence

```solidity
uint[] storage myArray = stateArray; // Points to state variable
```

2. Memory:
   - Temporary data that exists only during function execution
   - Less expensive than storage
   - Can be modified
   - Deleted after function exits
   - Use when: You need to modify data temporarily within a function

```solidity
uint[] memory tempArray = new uint[](5); // Temporary array
```

3. Calldata:
   - Read-only temporary data location
   - Most gas efficient
   - Cannot be modified
   - Used mainly for function parameters
   - Use when: You have function parameters you don't need to modify

```solidity
function process(uint[] calldata data) external {
    // data cannot be modified
}
```

Quick reference for when to use each:

```solidity
// Use storage for:
function modifyState(uint index) public {
    uint[] storage arr = myStateArray; // Modifying state
    arr[index] = 100;
}

// Use memory for:
function temporaryOperation() public view returns (uint[] memory) {
    uint[] memory temp = new uint[](5); // Temporary calculations
    return temp;
}

// Use calldata for:
function readOnlyOperation(bytes calldata data) external {
    // Reading external function parameters
}
```

Would you like me to provide more specific examples for your MultiSignatureWallet case?

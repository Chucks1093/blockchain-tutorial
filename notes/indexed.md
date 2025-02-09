The `indexed` keyword in events serves several important purposes:

1. Efficient Filtering

```solidity
// You can efficiently search for events with indexed parameters
event TransactionSubmitted(
    bytes32 indexed txHash,   // Can filter by txHash
    address indexed from,     // Can filter by sender
    address indexed to,       // Can filter by recipient
    uint256 amount,          // Not indexed - can't filter
    bytes data               // Not indexed - can't filter
);
```

2. Technical Details:

- Indexed parameters are stored as topics in the event log
- Maximum of 3 indexed parameters per event
- Indexed parameters can be searched efficiently using bloom filters
- Non-indexed parameters are stored in the data part of the log

3. Common Use Cases:

```solidity
// For tracking specific addresses
event Transfer(address indexed from, address indexed to);

// For tracking specific tokens/contracts
event Approval(address indexed owner, address indexed spender);

// For tracking specific IDs
event TokenMinted(uint256 indexed tokenId, address indexed owner);
```

4. Limitations:

```solidity
// Can only index primitive types
event GoodEvent(address indexed user);     // Works
event BadEvent(struct indexed userStruct); // Won't work
```

Example of filtering in web3.js:

```javascript
// Can filter by indexed parameters
contract.events.TransactionSubmitted({
    filter: {
        from: userAddress,    // Can filter by 'from' because it's indexed
        to: recipientAddress  // Can filter by 'to' because it's indexed
    }
});
```

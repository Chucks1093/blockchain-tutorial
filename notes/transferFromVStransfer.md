Let me show you examples of when to use each approach:

1. Direct Transfer (token.transfer) is better for:

```solidity
// Simple deposits
contract SimpleStaking {
    function deposit(uint256 amount) external {
        // User simply sends tokens
        token.transferFrom(msg.sender, address(this), amount);
        // Track deposit
        userBalance[msg.sender] += amount;
    }
}
```

2. TransferFrom is better for complex operations:

```solidity
contract ComplexVesting {
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 duration
    ) external {
        // Check conditions first
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount >= minAmount, "Amount too small");
        require(duration >= minDuration, "Duration too short");
        
        // Calculate fees if any
        uint256 fee = calculateFee(amount);
        uint256 netAmount = amount - fee;
        
        // Move tokens only if everything is valid
        token.transferFrom(msg.sender, address(this), amount);
        
        // Pay fee to fee collector
        token.transfer(feeCollector, fee);
        
        // Create schedule with net amount
        schedules[beneficiary] = Schedule(netAmount, block.timestamp, duration);
    }
}
```

3. Real-world example - NFT Marketplace:

```solidity
contract NFTMarketplace {
    // BAD: Direct transfer
    function buyNFT(uint256 tokenId) external {
        // What if NFT is already sold?
        // What if price changed?
        // Tokens already moved, need refund
        token.transfer(address(this), price);
        nft.transferFrom(seller, msg.sender, tokenId);
    }

    // GOOD: Using transferFrom
    function buyNFT(uint256 tokenId) external {
        // Check everything first
        require(nft.ownerOf(tokenId) == seller, "Already sold");
        require(price == currentPrice[tokenId], "Price changed");
        
        // Move tokens and NFT in one transaction
        token.transferFrom(msg.sender, seller, price);
        nft.transferFrom(seller, msg.sender, tokenId);
    }
}
```

4. Complex DeFi example:

```solidity
contract LiquidityPool {
    function addLiquidity(uint256 tokenAAmount, uint256 tokenBAmount) external {
        // Calculate optimal amounts
        (uint256 optimalA, uint256 optimalB) = calculateOptimalAmounts(
            tokenAAmount, 
            tokenBAmount
        );
        
        // Move exact amounts needed
        tokenA.transferFrom(msg.sender, address(this), optimalA);
        tokenB.transferFrom(msg.sender, address(this), optimalB);
        
        // Mint LP tokens
        mint(msg.sender, calculateLPTokens(optimalA, optimalB));
    }
}
```

Key points when choosing:

1. Use transferFrom when you need to:

- Check conditions before moving tokens
- Handle complex calculations
- Interact with multiple contracts
- Need exact amounts

2. Use direct transfer when:

- Simple deposits
- No complex conditions
- User initiates action
- No need for precise amounts

Want me to explain any of these examples in more detail?

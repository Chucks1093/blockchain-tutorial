Let me explain how the time conversion works in Solidity:

```solidity
// When you write this
uint256 cliffDuration = 2 * 30 days;

// Solidity automatically converts it to seconds because:
1 days = 24 * 60 * 60 = 86400 seconds

// So when you do 2 * 30 days, it actually calculates:
2 * 30 * 86400 = 5,184,000 seconds
```

Let's break it down:

```solidity
// For 2 months cliff:
2 months * 30 days = 60 days
60 days * 86400 seconds = 5,184,000 seconds

// For 32 months vesting:
32 months * 30 days = 960 days
960 days * 86400 seconds = 82,944,000 seconds
```

This is why when you do:

```solidity
vestingSchedules.push(
    VestingSchedule({
        cliffDuration: 2 * 30 days,    // Stores 5,184,000 seconds
        duration: 32 * 30 days,        // Stores 82,944,000 seconds
        startTime: block.timestamp,    // Also in seconds
        // ... other fields
    })
);
```

Everything is stored in seconds because:

- `block.timestamp` is in seconds
- Solidity's time units automatically convert to seconds
- Makes calculations more precise

Want me to show you how to verify these values or debug them?

Yes! Solidity has built-in time units. Here are all the time units you can use:

```solidity
1 seconds
1 minutes (= 60 seconds)
1 hours (= 60 minutes)
1 days (= 24 hours)
1 weeks (= 7 days)
```

For example:

```solidity
uint256 public constant QUARTER = 90 days;  // 90 days in seconds
uint256 public constant MONTH = 30 days;    // 30 days in seconds
uint256 cliff = 4 weeks;                    // 4 weeks in seconds
uint256 oneYear = 365 days;                 // 365 days in seconds
```

When you use these units, Solidity automatically converts them to seconds. So `90 days` is actually converting to: `90 * 24 * 60 * 60` seconds.

Note: These units are integer literals and are used at a constant basis. The actual calendar month or year lengths (like leap years) are not taken into account. When you use `30 days` it's exactly that - 30 *24* 60 * 60 seconds.

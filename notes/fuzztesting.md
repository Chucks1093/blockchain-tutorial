# Fuzz Testing

Fuzz testing (or fuzzing) is a software testing technique that involves providing invalid, unexpected, or random data as inputs to test how a program handles it. Let me show you a practical example using Foundry's fuzzing capabilities:

```ts
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

// Contract we want to test
contract Wallet {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}

// Test contract with fuzz tests
contract WalletTest is Test {
    Wallet public wallet;

    function setUp() public {
        wallet = new Wallet();
    }

    // Fuzz test for deposit and withdraw
    function testFuzz_DepositWithdraw(uint256 depositAmount, uint256 withdrawAmount) public {
        // Bound deposit amount to something reasonable
        depositAmount = bound(depositAmount, 0, 100 ether);
        
        // Make sure we have enough ETH for the test
        vm.deal(address(this), depositAmount);
        
        // Deposit funds
        wallet.deposit{value: depositAmount}();
        
        // Bound withdraw to deposit amount
        withdrawAmount = bound(withdrawAmount, 0, depositAmount);
        
        // Try withdrawal
        wallet.withdraw(withdrawAmount);
        
        // Assert final state
        assertEq(wallet.balances(address(this)), depositAmount - withdrawAmount);
    }

    // Fuzz test to check if multiple deposits work correctly
    function testFuzz_MultipleDeposits(uint256[] calldata amounts) public {
        uint256 totalDeposited = 0;
        
        // Test up to 10 deposits
        uint256 numDeposits = bound(amounts.length, 0, 10);
        
        for(uint256 i = 0; i < numDeposits; i++) {
            // Bound each deposit to something reasonable
            uint256 amount = bound(amounts[i], 0, 10 ether);
            vm.deal(address(this), amount);
            
            wallet.deposit{value: amount}();
            totalDeposited += amount;
        }
        
        assertEq(wallet.balances(address(this)), totalDeposited);
    }

    // Fuzz test for invalid withdrawals
    function testFuzz_RevertOnInsufficientBalance(uint256 depositAmount, uint256 withdrawAmount) public {
        // Bound deposit amount
        depositAmount = bound(depositAmount, 0, 100 ether);
        vm.deal(address(this), depositAmount);
        
        wallet.deposit{value: depositAmount}();
        
        // Try to withdraw more than deposited
        withdrawAmount = bound(withdrawAmount, depositAmount + 1, type(uint256).max);
        
        // Expect revert
        vm.expectRevert("Insufficient balance");
        wallet.withdraw(withdrawAmount);
    }

    receive() external payable {}
}

```

Key points about fuzz testing:

1. **How it works:**
   - Instead of fixed inputs, test parameters are randomly generated
   - Tests are run multiple times with different inputs
   - Foundry by default runs 256 fuzz tests per function

2. **Benefits:**
   - Finds edge cases you might not think of
   - Tests boundary conditions automatically
   - Identifies unexpected behaviors
   - Better test coverage

3. **Common fuzz testing techniques:**
   - Input bounds testing
   - Random data generation
   - Boundary value analysis
   - State transition testing

4. **Running fuzz tests in Foundry:**

```bash
forge test --match-test testFuzz
```

5. **Best practices:**
   - Bound your inputs to reasonable ranges
   - Test edge cases explicitly
   - Use invariant checks
   - Consider state before and after operations

Would you like me to explain any specific aspect of fuzz testing in more detail or show more examples?

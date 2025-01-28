In Solidity, you can make a contract inherit from multiple contracts using the `is` keyword and listing all parent contracts separated by commas. Here's how:

```solidity
// Parent contracts
contract A {
    // Contract A code
}

contract B {
    // Contract B code
}

contract C {
    // Contract C code
}

// Child contract inheriting from multiple contracts
contract Child is A, B, C {
    // Child contract code
}
```

Some important things to note about multiple inheritance in Solidity:

1. **Order Matters**:

```solidity
// The order of inheritance matters for constructor arguments
contract Child is A, B, C {
    constructor() A(param1) B(param2) C(param3) {
        // constructor code
    }
}
```

2. **Using Super**:

```solidity
contract Child is A, B {
    function someFunction() public override(A, B) {
        super.someFunction(); // Calls parent implementations
    }
}
```

3. **Interface Inheritance**:

```solidity
interface IToken {
    // interface functions
}

interface IVesting {
    // interface functions
}

contract TokenVesting is IToken, IVesting {
    // Implementation
}
```

4. **Diamond Inheritance Example**:

```solidity
contract Human {
    function speak() public virtual returns (string memory) {
        return "Hello";
    }
}

contract Mother is Human {
    function speak() public virtual override returns (string memory) {
        return "Hi, I'm mom";
    }
}

contract Father is Human {
    function speak() public virtual override returns (string memory) {
        return "Hi, I'm dad";
    }
}

// Child inherits from both Mother and Father
contract Child is Mother, Father {
    // Must override speak() due to multiple inheritance
    function speak() public override(Mother, Father) returns (string memory) {
        return super.speak(); // Will call the rightmost parent's implementation
    }
}
```

5. **With Abstract Contracts**:

```solidity
abstract contract Base {
    function abstractFunction() public virtual;
}

contract Feature {
    function featureFunction() public pure returns (uint) {
        return 42;
    }
}

contract Complete is Base, Feature {
    function abstractFunction() public pure override {
        // Implementation
    }
}
```

Remember these important rules:

- You must implement all abstract functions from parent contracts
- When overriding functions from multiple parents, specify all contracts in the override modifier
- The order of inheritance affects how `super` calls work
- Solidity uses C3 linearization to resolve inheritance conflicts

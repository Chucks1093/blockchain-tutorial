I'll help you create a guide for integrating Solidity smart contracts into your React Vite app using ethers.js. Based on your project structure, I'll create a practical example.

```typescript
// 1. First, install required dependencies:
// npm install ethers @web3-react/core @web3-react/injected-connector

// 2. Create a contract ABI type (src/types/contracts.ts)
export interface NFTMarketplaceContract {
  // Define your contract's function types here
  mintNFT: (tokenURI: string) => Promise<void>;
  listNFT: (tokenId: number, price: string) => Promise<void>;
  // Add other contract functions...
}

// 3. Create a contract service (src/services/contractService.ts)
import { ethers } from 'ethers';
import { NFTMarketplaceContract } from '../types/contracts';

// Import your contract ABI
import NFTMarketplaceABI from '../contracts/NFTMarketplace.json';

export class ContractService {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;
  private nftMarketplace: ethers.Contract & NFTMarketplaceContract;

  constructor() {
    // Initialize ethers with MetaMask provider
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();

    // Initialize contract instance
    this.nftMarketplace = new ethers.Contract(
      process.env.VITE_NFT_MARKETPLACE_ADDRESS!, // Contract address
      NFTMarketplaceABI,
      this.signer
    ) as ethers.Contract & NFTMarketplaceContract;
  }

  // Connect to MetaMask
  async connectWallet(): Promise<string> {
    try {
      // Request account access
      await this.provider.send('eth_requestAccounts', []);
      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  // Contract interaction methods
  async mintNFT(tokenURI: string): Promise<void> {
    try {
      const tx = await this.nftMarketplace.mintNFT(tokenURI);
      await tx.wait(); // Wait for transaction confirmation
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  async listNFT(tokenId: number, price: string): Promise<void> {
    try {
      const tx = await this.nftMarketplace.listNFT(tokenId,
        ethers.utils.parseEther(price));
      await tx.wait();
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  }
}

// 4. Create a custom hook (src/hooks/useContract.ts)
import { useState, useCallback } from 'react';
import { ContractService } from '../services/contractService';

export function useContract() {
  const [contractService] = useState(() => new ContractService());
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const connect = useCallback(async () => {
    try {
      const address = await contractService.connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
      return address;
    } catch (error) {
      console.error('Error connecting:', error);
      throw error;
    }
  }, [contractService]);

  const mintNFT = useCallback(async (tokenURI: string) => {
    if (!isConnected) throw new Error('Wallet not connected');
    await contractService.mintNFT(tokenURI);
  }, [contractService, isConnected]);

  const listNFT = useCallback(async (tokenId: number, price: string) => {
    if (!isConnected) throw new Error('Wallet not connected');
    await contractService.listNFT(tokenId, price);
  }, [contractService, isConnected]);

  return {
    isConnected,
    walletAddress,
    connect,
    mintNFT,
    listNFT
  };
}

// 5. Usage in a React component (src/features/nft-marketplace/components/NFTCard.tsx)
import React from 'react';
import { useContract } from '../../../hooks/useContract';

export const NFTCard: React.FC = () => {
  const { isConnected, connect, mintNFT, listNFT } = useContract();

  const handleMint = async () => {
    try {
      if (!isConnected) {
        await connect();
      }
      await mintNFT('ipfs://your-token-uri');
      // Handle success
    } catch (error) {
      // Handle error
      console.error('Error minting NFT:', error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">NFT Card</h2>
      <button
        onClick={handleMint}
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        {isConnected ? 'Mint NFT' : 'Connect Wallet'}
      </button>
    </div>
  );
};
```

// 6. Environment variables (.env)
`VITE_NFT_MARKETPLACE_ADDRESS=your_contract_address_here`

This integration guide sets up a complete system for interacting with your Solidity smart contracts from your React Vite application. Here's what each part does:

1. **Types**: Defines TypeScript interfaces for your contract functions, ensuring type safety.

2. **ContractService**: A service class that:
   - Initializes ethers.js with MetaMask
   - Handles wallet connection
   - Manages contract interactions
   - Provides error handling

3. **useContract Hook**: A custom React hook that:
   - Manages wallet connection state
   - Provides contract functions to components
   - Handles connection status

4. **Component Integration**: Shows how to use the hook in a React component

To use this in your project:

1. Install dependencies:

```bash
npm install ethers @web3-react/core @web3-react/injected-connector
```

2. Copy the contract ABI:
   - After compiling your Solidity contracts with Foundry
   - Copy the ABI from `contracts/nft-marketplace/out/NFTMarketplace.sol/NFTMarketplace.json`
   - Place it in your React project's src directory

3. Set up your environment variables in `.env`:

```
VITE_NFT_MARKETPLACE_ADDRESS=your_deployed_contract_address
```

4. Add contract type declarations as needed for your specific smart contract functions.

Remember to:

- Handle network changes and disconnections
- Add proper error handling for contract interactions
- Consider implementing loading states for transactions
- Add transaction receipt handling for better UX

Would you like me to explain any specific part in more detail or show how to implement additional contract functionality?

I'll show you the complete setup with both the BaseContract and the GreetingContract:

```typescript
// src/lib/contracts/BaseContract.ts
import { ethers } from 'ethers';

export abstract class BaseContract {
    protected provider: ethers.BrowserProvider | null = null;
    protected contract: ethers.Contract | null = null;

    constructor(
        protected readonly contractAddress: string,
        protected readonly contractABI: any[]
    ) {}

    async init() {
        if (!window.ethereum) {
            throw new Error("Ethereum provider not found");
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.contract = new ethers.Contract(
            this.contractAddress,
            this.contractABI,
            this.provider
        );
    }

    protected async getSigner() {
        if (!this.provider) {
            throw new Error("Provider not initialized");
        }
        return await this.provider.getSigner();
    }

    getContract() {
        return this.contract;
    }

    getProvider() {
        return this.provider;
    }
}

// src/lib/contracts/GreetingContract.ts
import { BaseContract } from './BaseContract';
import { Greeting } from '../../types/contracts/Greeting';

export class GreetingContract extends BaseContract {
    private typedContract: Greeting | null = null;

    async init() {
        await super.init();
        this.typedContract = this.contract as Greeting;
    }

    async getGreeting(): Promise<string> {
        if (!this.typedContract) {
            throw new Error("Contract not initialized");
        }
        return await this.typedContract.getGreeting();
    }

    async setGreeting(newGreeting: string): Promise<void> {
        if (!this.typedContract) {
            throw new Error("Contract not initialized");
        }

        const signer = await this.getSigner();
        const contractWithSigner = this.typedContract.connect(signer);
        
        const tx = await contractWithSigner.setGreeting(newGreeting);
        await tx.wait();
    }

    onGreetingSet(callback: (newGreeting: string, setter: string) => void) {
        if (!this.typedContract) {
            throw new Error("Contract not initialized");
        }

        this.typedContract.on('GreetingSet', (greeting: string, setter: string) => {
            callback(greeting, setter);
        });

        return () => {
            this.typedContract?.off('GreetingSet');
        };
    }
}

// src/lib/config/contracts.ts
export const GREETING_CONFIG = {
    address: "your_contract_address",
    abi: [...] // Your contract ABI
} as const;

// src/components/GreetingComponent.tsx
import { useEffect, useState } from 'react';
import { GreetingContract } from '../lib/contracts/GreetingContract';
import { GREETING_CONFIG } from '../lib/config/contracts';

function GreetingComponent() {
    const [greeting, setGreeting] = useState<string>('');
    const [contract, setContract] = useState<GreetingContract | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initContract = async () => {
            try {
                const greetingContract = new GreetingContract(
                    GREETING_CONFIG.address,
                    GREETING_CONFIG.abi
                );
                await greetingContract.init();
                setContract(greetingContract);

                const cleanup = greetingContract.onGreetingSet((newGreeting, setter) => {
                    console.log(`Greeting updated to: ${newGreeting} by ${setter}`);
                    setGreeting(newGreeting);
                });

                return cleanup;
            } catch (err) {
                setError("Failed to initialize contract");
                console.error(err);
            }
        };

        initContract();
    }, []);

    const fetchGreeting = async () => {
        if (!contract) return;

        try {
            setLoading(true);
            const currentGreeting = await contract.getGreeting();
            setGreeting(currentGreeting);
            setError(null);
        } catch (err) {
            setError("Failed to fetch greeting");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGreeting();
    }, [contract]);

    const handleUpdateGreeting = async (newGreeting: string) => {
        if (!contract) return;

        try {
            setLoading(true);
            await contract.setGreeting(newGreeting);
            setError(null);
        } catch (err) {
            setError("Failed to update greeting");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Current Greeting: {greeting}</h2>
            <button onClick={() => handleUpdateGreeting("New Greeting!")}>
                Update Greeting
            </button>
        </div>
    );
}

export default GreetingComponent;
```

This setup gives you:

1. A reusable `BaseContract` class for common functionality
2. Type-safe contract interactions through the `GreetingContract` class
3. Proper error handling and initialization
4. Event handling
5. Clean component implementation

The flow is:

1. `BaseContract` handles basic ethereum provider and contract setup
2. `GreetingContract` extends it with specific contract functionality
3. React component uses the `GreetingContract` class for all interactions

Benefits:

- Separation of concerns
- Reusable contract logic
- Type safety
- Easy to add new contract methods
- Consistent error handling

Would you like me to explain any specific part in more detail?

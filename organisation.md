```js
blockchain-projects/
│
├── public/
│ └── favicon.ico
│
├── src/
│ ├── components/
│ │ ├── common/
│ │ │ ├── Navbar.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ └── Layout.tsx
│ │ └── shared/
│ │ ├── WalletConnectButton.tsx
│ │ └── NetworkSelector.tsx
│ │
│ ├── features/
│ │ ├── home/
│ │ │ ├── HomePage.tsx
│ │ │ └── HomePage.module.css
│ │ │
│ │ ├── nft-marketplace/
│ │ │ ├── components/
│ │ │ │ ├── NFTList.tsx
│ │ │ │ ├── NFTCard.tsx
│ │ │ │ └── CreateNFTModal.tsx
│ │ │ ├── pages/
│ │ │ │ ├── MarketplacePage.tsx
│ │ │ │ ├── MyNFTsPage.tsx
│ │ │ │ └── CreateNFTPage.tsx
│ │ │ ├── hooks/
│ │ │ │ └── useNFTMarketplace.ts
│ │ │ └── services/
│ │ │ └── nftMarketplaceService.ts
│ │ │
│ │ ├── defi-dashboard/
│ │ │ ├── components/
│ │ │ │ ├── LiquidityPool.tsx
│ │ │ │ ├── StakingWidget.tsx
│ │ │ │ └── YieldFarmingChart.tsx
│ │ │ ├── pages/
│ │ │ │ ├── DashboardPage.tsx
│ │ │ │ ├── PoolsPage.tsx
│ │ │ │ └── StakingPage.tsx
│ │ │ ├── hooks/
│ │ │ │ └── useDeFiData.ts
│ │ │ └── services/
│ │ │ └── defiService.ts
│ │ │
│ │ └── token-swap/
│ │ ├── components/
│ │ │ ├── SwapInterface.tsx
│ │ │ ├── TokenSelector.tsx
│ │ │ └── PriceComparison.tsx
│ │ ├── pages/
│ │ │ └── SwapPage.tsx
│ │ ├── hooks/
│ │ │ └── useTokenSwap.ts
│ │ └── services/
│ │ └── swapService.ts
│ │
│ ├── contexts/
│ │ ├── WalletContext.tsx
│ │ └── Web3Provider.tsx
│ │
│ ├── hooks/
│ │ ├── useWallet.ts
│ │ └── useWeb3.ts
│ │
│ ├── redux/
│ │ ├── store.ts
│ │ ├── rootReducer.ts
│ │ └── slices/
│ │ ├── walletSlice.ts
│ │ ├── nftMarketplaceSlice.ts
│ │ └── defiSlice.ts
│ │
│ ├── services/
│ │ ├── web3Service.ts
│ │ └── contractService.ts
│ │
│ ├── types/
│ │ ├── wallet.ts
│ │ ├── nft.ts
│ │ └── blockchain.ts
│ │
│ ├── utils/
│ │ ├── formatters.ts
│ │ └── contractHelpers.ts
│ │
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css
│
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
│
└── contracts/ # Foundry Project Root
├── nft-marketplace/ # Individual Contract Project
│ ├── src/ # Smart Contract Source Code
│ │ ├── NFTMarketplace.sol
│ │ ├── NFTCollection.sol
│ │ └── Royalties.sol
│ │
│ ├── test/ # Foundry Test Directory
│ │ ├── NFTMarketplace.t.sol
│ │ └── NFTCollection.t.sol
│ │
│ ├── script/ # Deployment and Interaction Scripts
│ │ ├── DeployNFTCollection.s.sol
│ │ └── DeployMarketplace.s.sol
│ │
│ └── foundry.toml # Foundry Configuration for this Project
│
├── defi-dashboard/
│ ├── src/
│ │ ├── StakingPool.sol
│ │ ├── LiquidityPool.sol
│ │ └── RewardToken.sol
│ │
│ ├── test/
│ │ └── StakingPool.t.sol
│ │
│ ├── script/
│ │ └── DeployStakingContracts.s.sol
│ │
│ └── foundry.toml
│
└── token-swap/
├── src/
│ ├── TokenSwap.sol
│ ├── SwapRouter.sol
│ └── TokenFactory.sol
│
├── test/
│ └── TokenSwap.t.sol
│
├── script/
│ └── DeploySwapContracts.s.sol
│
└── foundry.toml
```

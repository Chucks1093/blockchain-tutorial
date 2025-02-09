# Include .env file if it exists
-include .env

# ========== Configuration Variables ==========
# Default network
NETWORK ?= local

# Anvil configurations
ANVIL_PORT ?= 8545

# Ganache configurations
GANACHE_PORT ?= 7545


# Frontend path
FRONTEND_PATH := ../frontend


# Compiler configurations
FOUNDRY_PROFILE ?= default

# Network-specific configurations
ifeq ($(NETWORK),local)
	RPC_URL ?= http://127.0.0.1:$(ANVIL_PORT)
	CHAIN_ID ?= 31337
else ifeq ($(NETWORK),quicknode)
	RPC_URL ?=https://sepolia.base.org
	CHAIN_ID ?= 11155111  
else ifeq ($(NETWORK),sepolia)
	RPC_URL ?= $(SEPOLIA_RPC_URL)
	CHAIN_ID ?= 11155111
else ifeq ($(NETWORK),mainnet)
	RPC_URL ?= $(MAINNET_RPC_URL)
	CHAIN_ID ?= 1
endif

# ========== Phony Targets ==========
.PHONY: all test clean deploy install update build help new-wallet list-wallets \
        anvil-start anvil-stop anvil-restart anvil-status deploy-local deploy-sepolia \
        deploy-mainnet coverage snapshot generate-types format delete-wallet test-gas

# ========== Default Target ==========
all: clean install build test

# ========== Foundry Commands ==========
# Install dependencies
install:
	forge install

# Update dependencies
update:
	forge update

# Build the project
build:
	forge build --optimize

# Run tests
test:
	forge test -vvv

# Run tests with gas report
test-gas:
	forge test --gas-report

# Clean build artifacts
clean:
	forge clean

# Run forge coverage
coverage:
	forge coverage

# Run forge snapshot
snapshot:
	forge snapshot

# Format code
format:
	forge fmt


# ========== Wallet Management ==========
new-wallet:
	@echo "Creating new wallet..."
	@read -p "Enter key name: " key_name; \
	cast wallet import $$key_name --interactive

list-wallets:
	@echo "Available wallets:"
	@ls -la ~/.foundry/keystores

delete-wallet:
	@echo "Enter wallet name to delete:"
	@read wallet_name; \
	rm -i ~/.foundry/keystores/$$wallet_name

# ========== Deployment Commands ==========
deploy:
	@if [ "$(NETWORK)" = "local" ] || [ "$(NETWORK)" = "ganache" ]; then \
		echo "Deploying to $(NETWORK) network..."; \
		echo "Available deployment scripts:"; \
		ls script/simple-tasks/*.s.sol | cat -n; \
		read -p "Select script number to deploy: " script_number; \
		selected_script=$$(ls script/simple-tasks/*.s.sol | sed -n "$$script_number"p); \
		read -p "Enter address: " address; \
		read -p "Enter key name: " key_name; \
		forge script $$selected_script --rpc-url $(RPC_URL) --account $$key_name --sender $$address --broadcast | tee deployment.log; \
	else \
		echo "Deploying to $(NETWORK)..."; \
		echo "Available deployment scripts:"; \
		ls script/simple-tasks/*.s.sol | cat -n; \
		read -p "Select script number to deploy: " script_number; \
		selected_script=$$(ls script/simple-tasks/*.s.sol | sed -n "$$script_number"p); \
		read -p "Enter address: " address; \
		read -p "Enter key name: " key_name; \
		forge script $$selected_script --rpc-url $(RPC_URL) --account $$key_name --sender $$address --broadcast --verify --etherscan-api-key ${BASESCAN_API_KEY} --chain-id $(CHAIN_ID) --account myKey -vvvv | tee deployment.log; \
	fi

deploy-local: 
	@make deploy NETWORK=local

deploy-sepolia: 
	@make deploy NETWORK=sepolia

deploy-quicknode: 
	@make deploy NETWORK=quicknode

deploy-mainnet: 
	@make deploy NETWORK=mainnet

# ========== Frontend Commands ==========
generate-types:
	@echo "Generating types in frontend..."
	@cd $(FRONTEND_PATH) && npx typechain --target ethers-v6 --out-dir src/types/contracts "../contracts/out/MultiSignatureWallet.sol/*json" --show-stack-traces

# ========== Help ==========
help:
	@echo "Available commands:"
	@echo "Foundry Commands:"
	@echo "  make install         - Install dependencies"
	@echo "  make update         - Update dependencies"
	@echo "  make build          - Build the project"
	@echo "  make test           - Run tests"
	@echo "  make test-gas       - Run tests with gas report"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make coverage       - Run forge coverage"
	@echo "  make snapshot       - Run forge snapshot"
	@echo "  make format         - Format code"
	@echo ""
	@echo "Anvil Commands:"
	@echo "  make anvil-start    - Start Anvil node"
	@echo "  make anvil-stop     - Stop Anvil node"
	@echo "  make anvil-restart  - Restart Anvil node"
	@echo "  make anvil-status   - Check Anvil node status"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make deploy         - Deploy contract (specify NETWORK=local|sepolia|mainnet)"
	@echo "  make deploy-local   - Deploy to local network"
	@echo "  make deploy-sepolia - Deploy to Sepolia testnet"
	@echo "  make deploy-mainnet - Deploy to mainnet"
	@echo ""
	@echo "Wallet Commands:"
	@echo "  make new-wallet     - Create new wallet"
	@echo "  make list-wallets   - List available wallets"
	@echo "  make delete-wallet  - Delete a wallet"
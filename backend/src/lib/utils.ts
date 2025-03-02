import { ethers } from "ethers";
import { logger } from "./logger";

// Configure provider based on the network
export const getProvider = (network: string) => {
	switch (network.toLowerCase()) {
		case "mainnet":
			return new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
		case "anvil":
			return new ethers.JsonRpcProvider(process.env.ANVIL_RPC_URL);
		case "sepolia":
			return new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
		// Add more networks as needed
		default:
			return new ethers.JsonRpcProvider();
	}
};

/**
 * Generic event listener function that accepts any contract factory
 * @param contractAddress The address of the contract to listen to
 * @param eventName The name of the event to listen for
 * @param providerUrl The RPC URL for the blockchain provider
 * @param callback Function to call when event is received
 * @param factory The contract factory to use for connection
 * @returns Promise with a cleanup function to stop listening
 */
export const listenForEvent = <T extends ethers.BaseContract>(
	factory: {
		connect(
			address: string,
			providerOrSigner: ethers.Provider | ethers.Signer
		): T;
	},
	contractAddress: string,
	eventName: string,
	providerUrl: string,
	callback: (...args: any[]) => void
): Promise<() => void> => {
	return new Promise((resolve, reject) => {
		try {
			// Initialize provider and contract
			const provider = new ethers.JsonRpcProvider(providerUrl);
			const contract = factory.connect(contractAddress, provider);

			console.log(
				`Setting up listener for ${eventName} events from ${contractAddress}`
			);

			// Set up the event listener
			const transactionEvent = contract.getEvent(eventName);

			contract.on(transactionEvent, (...args) => {
				// Extract event args and pass to callback
				callback(...args);
			});

			// Create cleanup function that can be called to stop listening
			const cleanup = () => {
				console.log(`Removing listener for ${eventName}`);
				contract.removeAllListeners(eventName);
				provider.removeAllListeners();
			};

			// Resolve immediately with the cleanup function
			resolve(cleanup);
		} catch (error) {
			reject(error);
		}
	});
};

// Get gas price with backoff retry logic
export const getFeeData = async (
	network: string,
	retryCount = 0
): Promise<ethers.FeeData> => {
	try {
		const wallet = getWallet(network);
		return await wallet.provider!.getFeeData();
	} catch (error) {
		if (retryCount < 3) {
			logger.warn({ error }, "Error getting fee data, retrying...");
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return getFeeData(network);
		}
		throw error;
	}
};

/**

* ██████╗  █████╗ ███╗   ██╗ ██████╗ ███████╗██████╗
* ██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██╔════╝██╔══██╗
* ██║  ██║███████║██╔██╗ ██║██║  ███╗█████╗  ██████╔╝
* ██║  ██║██╔══██║██║╚██╗██║██║   ██║██╔══╝  ██╔══██╗
* ██████╔╝██║  ██║██║ ╚████║╚██████╔╝███████╗██║  ██║
* ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
*
* ⚠️ WARNING: DEVELOPMENT USE ONLY ⚠️
 */

export function getWallet(network: string): ethers.Wallet {
	const provider = getProvider(network);

	const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
	if (!privateKey) {
		throw new Error(
			"DEPLOYER_PRIVATE_KEY environment variable is not defined"
		);
	}

	return new ethers.Wallet(privateKey, provider);
}

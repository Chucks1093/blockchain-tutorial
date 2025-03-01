import { getProvider, listenForEvent } from "../lib/utils";
import { ethers } from "ethers";
import { DeployLocalAutomator__factory } from "../types/contracts";
import { getUpKeepByAddress } from "./automation.model";
import { prisma } from "../lib/prisma";

export const deployAutmator = async (
	contractAddress: string,
	intervalSeconds: number,
	owner: string,
	network = "anvil"
) => {
	/**
	 * ⚠️ WARNING: DEVELOPMENT USE ONLY ⚠️
	 * =========================================
	 * */
	const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
	if (!privateKey) {
		throw new Error(
			"DEPLOYER_PRIVATE_KEY environment variable is not defined"
		);
	}
	const deployerAutomatorAddress =
		process.env.DEPLOYLOCALAUTOMATOR_CONTRACT_ADDRESS;
	if (!deployerAutomatorAddress) {
		throw new Error(
			"DEPLOYLOCALAUTOMATOR_CONTRACT_ADDRESS environment variable is not defined"
		);
	}
	const provider = getProvider("anvil");

	const wallet = new ethers.Wallet(privateKey, provider);

	const deployLocalAutomator = DeployLocalAutomator__factory.connect(
		deployerAutomatorAddress,
		wallet
	);

	console.log(
		`Deploying automator for contract ${contractAddress} on ${network} with interval ${intervalSeconds}s ...`
	);

	try {
		const tx = await deployLocalAutomator.deployAutomator(
			contractAddress,
			intervalSeconds,
			owner
		);
		await tx.wait();
	} catch (error) {
		console.error(
			`Failed to deploy automator for ${contractAddress}:`,
			error
		);
		throw error;
	}
};

export const listenForAutomatorDeployed = async () => {
	const deployerAutomatorAddress =
		process.env.DEPLOYLOCALAUTOMATOR_CONTRACT_ADDRESS;

	const providerUrl = "http://127.0.0.1:8545";

	if (!deployerAutomatorAddress) {
		throw new Error(
			"DEPLOYLOCALAUTOMATOR_CONTRACT_ADDRESS environment variable is not defined"
		);
	}

	const cleanup = await listenForEvent(
		DeployLocalAutomator__factory,
		deployerAutomatorAddress,
		"AutomatorDeployed",
		providerUrl,
		async (targetContract: string, automator: string, interval: bigint) => {
			await prisma.upkeepContract.update({
				where: { contractAddress: targetContract },
				data: {
					automatorAddress: automator,
				},
			});
			console.log(`New automator deployed for ${targetContract}`);
			console.log(`Address: ${automator}`);
			console.log(`Interval: ${interval.toString()} seconds`);
		}
	);

	return cleanup;
};

export const onChainEventListeners = async () => {
	const stopListeningForAutomatorDeployed = await listenForAutomatorDeployed();

	return () => {
		stopListeningForAutomatorDeployed();
	};
};

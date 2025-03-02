import { listenForEvent } from "../lib/utils";
import { DeployLocalAutomator__factory } from "../types/contracts/factories/DeployLocalAutomator__factory";
import { prisma } from "../lib/prisma";

const listenForAutomatorDeployed = async () => {
	const deployerAutomatorAddress =
		process.env.DEPLOYLOCALAUTOMATOR_CONTRACT_ADDRESS;

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

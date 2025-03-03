import { listenForEvent } from "../lib/utils";
import { DeployLocalAutomator__factory } from "../types/contracts/factories/DeployLocalAutomator__factory";
import { prisma } from "../lib/prisma";
import { LocalAutomator__factory } from "../types/contracts";
import { getDeployerAutomatorAddress } from "./automation.utils";
import { getAllUpKeeps } from "./automation.model";
import eventBus, { AppEvent, AutomatorDeployedEvent } from "../lib/event-bus";
import { logger } from "../lib/logger";
import { providerUrl } from "../lib/constants";

const listenForAutomatorDeployed = async () => {
	const deployerAutomatorAddress = getDeployerAutomatorAddress();

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
			eventBus.emitAutomatorDeployed({
				automatorAddress: automator,
				targetContract: targetContract,
				// upkeepId: upkeep.id,
				// checkInterval: interval,
			});
			console.log(`New automator deployed for ${targetContract}`);
			console.log(`Address: ${automator}`);
			console.log(`Interval: ${interval.toString()} seconds`);
		}
	);

	return cleanup;
};

const listenForAutomatorTriggered = async (automatorAddress: string) => {
	const cleanup = await listenForEvent(
		LocalAutomator__factory,
		automatorAddress,
		"AutomationTriggered",
		providerUrl,
		async (timestamp: bigint, wasNeeded: boolean) => {
			console.log(`New automator deployed for ${automatorAddress}`);
			console.log(`Address: ${timestamp}`);
			console.log(`Interval: ${wasNeeded} seconds`);
		}
	);
	return cleanup;
};

const initializeAutomationTriggeredEvents = async () => {
	const cleanUpFunctions: Array<() => void> = [];
	const activeAutomators = await getAllUpKeeps(true);

	for (const upkeep of activeAutomators) {
		if (!upkeep.automatorAddress) continue;
		const cleanup = await listenForAutomatorTriggered(
			upkeep.automatorAddress
		);
		cleanUpFunctions.push(cleanup);
	}
	return () => cleanUpFunctions.forEach((cleanFn) => cleanFn());
};

/**
 * Initialize event listeners for automator deployment events
 */
export function initializeEventHandlers() {
	// Listen for automator deployment events

	eventBus.on(
		AppEvent.AUTOMATOR_DEPLOYED,
		async (data: AutomatorDeployedEvent) => {
			logger.info(
				`Event received: New automator deployed at ${data.automatorAddress}`
			);

			try {
				// Set up blockchain event listener for this automator
				await listenForAutomatorTriggered(data.automatorAddress);

				console.log(
					`Blockchain listener set up for automator ${data.automatorAddress}`
				);
			} catch (error) {
				logger.error(
					`Failed to set up listener for ${data.automatorAddress}:`,
					error
				);
			}
		}
	);

	// You can add more event handlers here

	console.log("Application event handlers initialized");
}

export const onChainEventListeners = async () => {
	const stopListeningForAutomatorDeployed = await listenForAutomatorDeployed();
	const stopListeningForAutomationTriggeredEvents =
		await initializeAutomationTriggeredEvents();

	return () => {
		stopListeningForAutomatorDeployed();
		stopListeningForAutomationTriggeredEvents();
	};
};

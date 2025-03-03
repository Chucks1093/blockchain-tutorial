import { getFeeData, getWallet } from "../lib/utils";
import { DeployLocalAutomator__factory } from "../types/contracts/factories/DeployLocalAutomator__factory";
import { prisma } from "../lib/prisma";
import { getDeployerAutomatorAddress } from "./automation.utils";
import { logger } from "../lib/logger";
import { LocalAutomator__factory } from "../types/contracts";
import { Metrics } from "./automation.schema";
import { recordCheckAndExecute } from "./automation.model";
import eventBus from "../lib/event-bus";
// Global runtime metrics
export const metrics: Metrics = {
	executionsTotal: 0,
	executionsSuccess: 0,
	executionsFailed: 0,
	lastExecutionTime: 0,
	avgExecutionTime: 0,
	gasUsedTotal: BigInt(0),
	memoryUsage: process.memoryUsage(),
};

// Track running executions to avoid overlaps
const runningExecutions = new Set<string>();

export const deployAutmator = async (
	contractAddress: string,
	intervalSeconds: number,
	owner: string,
	network = "anvil"
) => {
	const deployerAutomatorAddress = getDeployerAutomatorAddress();

	const wallet = getWallet("anvil");

	const deployLocalAutomator = DeployLocalAutomator__factory.connect(
		deployerAutomatorAddress,
		wallet
	);

	logger.info(
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

/**
 * Execute the checkAndExecute function with optimized error handling and metrics
 */
async function executeAutomator(
	automatorAddress: string,
	network: string,
	retryCount = 0
): Promise<boolean> {
	// Prevent concurrent executions of the same automator
	const executionId = `${network}:${automatorAddress}`;

	if (runningExecutions.has(executionId)) {
		logger.warn(
			{ automatorAddress, network },
			"Skipping execution, already in progress"
		);
		return false;
	}

	runningExecutions.add(executionId);
	const startTime = Date.now();

	const upkeep = await prisma.upkeepContract.findFirst({
		where: { automatorAddress },
	});

	if (!upkeep) {
		logger.error(
			{ automatorAddress },
			"Automator not associated with any upkeep"
		);
		runningExecutions.delete(executionId);
		return false;
	}

	try {
		metrics.executionsTotal++;
		logger.info({ automatorAddress, network }, "Executing automator");

		const wallet = getWallet(network);
		const automator = LocalAutomator__factory.connect(
			automatorAddress,
			wallet
		);

		// Execute with optimized gas settings
		const gasEstimate = await automator.checkAndExecute.estimateGas();
		const feeData = await getFeeData("anvil", retryCount);

		// Use legacy gas price for networks that don't support EIP-1559
		const txOptions = feeData.maxFeePerGas
			? {
					gasLimit: Math.floor(Number(gasEstimate) * 1.2), // Add 20% buffer
					maxFeePerGas: feeData.maxFeePerGas,
					maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
					type: 2, // EIP-1559
			  }
			: {
					gasLimit: Math.floor(Number(gasEstimate) * 1.2),
					gasPrice: feeData.gasPrice,
					type: 0, // Legacy
			  };

		// Send transaction with timeouts
		const tx = await Promise.race([
			automator.checkAndExecute(txOptions),
			new Promise<never>((_, reject) =>
				setTimeout(
					() => reject(new Error("Transaction submission timeout")),
					30000
				)
			),
		]);

		logger.info(
			{ txHash: tx.hash, automatorAddress },
			"Transaction submitted"
		);

		// Record pending transaction in history
		await recordCheckAndExecute(
			upkeep.id,
			upkeep.contractAddress,
			automatorAddress,
			"PENDING",
			false, // We don't know yet if upkeep was performed
			tx.hash
		);

		// Wait for confirmation
		const receipt = await Promise.race([
			tx.wait(), // Wait for 2 confirmations
			new Promise<never>((_, reject) =>
				setTimeout(
					() => reject(new Error("Transaction confirmation timeout")),
					20000
				)
			),
		]);

		// Update metrics
		metrics.executionsSuccess++;
		metrics.gasUsedTotal += receipt?.gasUsed || BigInt(0);

		// Update database
		await prisma.upkeepContract.update({
			where: { id: upkeep.id },
			data: {
				lastCheckedAt: new Date(),
				checkCount: { increment: 1 },
			},
		});

		// Record execution in history
		await recordCheckAndExecute(
			upkeep.id,
			upkeep.contractAddress,
			automatorAddress,
			"PENDING", // will record after trigger
			false,
			tx.hash,
			receipt?.blockNumber,
			receipt?.gasUsed
		);

		logger.info(
			{
				txHash: tx.hash,
				automatorAddress,
				blockNumber: receipt?.blockNumber,
				gasUsed: receipt?.gasUsed.toString(),
			},
			"Automator executed successfully"
		);

		return true;
	} catch (error) {
		console.log(error);
		metrics.executionsFailed++;
		logger.error(
			{
				automatorAddress,
				network,
				error,
			},
			"Failed to execute automator"
		);
		// Record failed execution in history
		await recordCheckAndExecute(
			upkeep.id,
			upkeep.contractAddress,
			automatorAddress,
			"ERROR",
			false,
			undefined,
			undefined,
			undefined
		);

		return false;
	} finally {
		// Update execution time metrics
		// const executionTime = Date.now() - startTime;
		// metrics.lastExecutionTime = executionTime;
		// metrics.avgExecutionTime =
		// 	(metrics.avgExecutionTime * (metrics.executionsTotal - 1) +
		// 		executionTime) /
		// 	metrics.executionsTotal;

		// // Update memory metrics occasionally
		// if (metrics.executionsTotal % 10 === 0) {
		// 	updateMemoryMetrics();
		// }

		// Remove from running set
		runningExecutions.delete(executionId);

		// Log metrics periodically
		// if (metrics.executionsTotal % 50 === 0) {
		// 	logger.info({ metrics }, "Automator service metrics");
		// }
	}
}

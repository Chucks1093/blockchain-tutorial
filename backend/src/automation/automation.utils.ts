// Metrics for monitoring
import { logger } from "../lib/logger";
import { Metrics } from "./automation.schema";

export const getDeployerAutomatorAddress = () => {
	const deployerAutomatorAddress =
		process.env.DEPLOYLOCALAUTOMATOR_CONTRACT_ADDRESS;
	if (!deployerAutomatorAddress) {
		throw new Error(
			"DEPLOYLOCALAUTOMATOR_CONTRACT_ADDRESS environment variable is not defined"
		);
	}
	return deployerAutomatorAddress;
};

export const calculateTimeUntilNextExecution = (
	lastCheckedAt: Date | null,
	intervalSeconds: number
) => {
	if (!lastCheckedAt) {
		return 0;
	}

	const elapsedSeconds = Math.floor(Date.now() - lastCheckedAt.getTime());
	return Math.max(0, intervalSeconds - elapsedSeconds);
};

export function updateMemoryMetrics(metrics: Metrics): void {
	metrics.memoryUsage = process.memoryUsage();

	// Check if we're approaching memory limits
	const heapUsedPercent =
		metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
	if (heapUsedPercent > 0.85) {
		logger.warn({ heapUsedPercent }, "High memory usage detected");

		// Force garbage collection if available (requires --expose-gc flag)
		if (global.gc) {
			logger.info("Forcing garbage collection");
			global.gc();
		}
	}
}

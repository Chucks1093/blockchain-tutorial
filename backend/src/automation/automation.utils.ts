// Metrics for monitoring
export interface Metrics {
	executionsTotal: number;
	executionsSuccess: number;
	executionsFailed: number;
	lastExecutionTime: number;
	avgExecutionTime: number;
	gasUsedTotal: bigint;
	memoryUsage: NodeJS.MemoryUsage;
}

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

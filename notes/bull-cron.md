```ts

// src/services/automator-service.ts
import { ethers } from "ethers";
import { LocalAutomator__factory } from "../typechain";
import { prisma } from "../lib/prisma";
import pino from "pino";
import os from "os";
import Bull from "bull";

// Structured logging for better PM2 log management
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  base: { pid: process.pid, hostname: os.hostname() },
});

// Metrics for monitoring
interface Metrics {
  executionsTotal: number;
  executionsSuccess: number;
  executionsFailed: number;
  lastExecutionTime: number;
  avgExecutionTime: number;
  gasUsedTotal: bigint;
  memoryUsage: NodeJS.MemoryUsage;
  queuedJobs: number;
}

// Global runtime metrics
const metrics: Metrics = {
  executionsTotal: 0,
  executionsSuccess: 0,
  executionsFailed: 0,
  lastExecutionTime: 0,
  avgExecutionTime: 0,
  gasUsedTotal: BigInt(0), // Using BigInt() instead of 0n for compatibility
  memoryUsage: process.memoryUsage(),
  queuedJobs: 0,
};

// Automator execution job data format
interface AutomatorJobData {
  automatorId: string;
  automatorAddress: string;
  network: string;
  retryCount?: number;
}

// Create Bull queues
const automatorQueue = new Bull<AutomatorJobData>("automator-execution", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds initial delay
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200, // Keep last 200 failed jobs
  },
});

// Track running executions to avoid overlaps
const runningExecutions = new Set<string>();

/**

* Update memory usage metrics
 */
function updateMemoryMetrics(): void {
  metrics.memoryUsage = process.memoryUsage();

  // Check if we're approaching memory limits
  const heapUsedPercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
  if (heapUsedPercent > 0.85) {
    logger.warn({ heapUsedPercent }, "High memory usage detected");

    // Force garbage collection if available (requires --expose-gc flag)
    if (global.gc) {
      logger.info("Forcing garbage collection");
      global.gc();
    }
  }
}

/**

* Get provider for a specific network with connection pooling
 */
const providers: Record<string, ethers.Provider> = {};
function getProvider(network: string): ethers.Provider {
  // Reuse existing provider if available
  if (providers[network]) {
    return providers[network];
  }

  let rpcUrl: string;
  switch (network.toLowerCase()) {
    case "mainnet":
      rpcUrl = process.env.MAINNET_RPC_URL || "";
      break;
    case "goerli":
      rpcUrl = process.env.GOERLI_RPC_URL || "";
      break;
    case "sepolia":
      rpcUrl = process.env.SEPOLIA_RPC_URL || "";
      break;
    case "anvil":
      rpcUrl = "<http://localhost:8545>";
      break;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }

  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for network ${network}`);
  }

  logger.info({ network }, "Creating new provider");

  // Create the appropriate provider
  const provider = rpcUrl.startsWith("wss://")
    ? new ethers.WebSocketProvider(rpcUrl)
    : new ethers.JsonRpcProvider(rpcUrl);

  // Add connection status monitoring
  provider.on("error", (error) => {
    logger.error({ network, error: error.message }, "Provider error");

    // Handle reconnection if needed
    delete providers[network];

    // If we have pending automators on this network, try to reconnect
    setTimeout(() => {
      logger.info({ network }, "Attempting to reconnect provider");
      getProvider(network);
    }, 5000);
  });

  // Cache the provider
  providers[network] = provider;
  return provider;
}

/**

* Get wallet for transaction signing
 */
function getWallet(network: string): ethers.Wallet {
  const provider = getProvider(network);

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY environment variable is not defined");
  }

  return new ethers.Wallet(privateKey, provider);
}

/**

* Execute the checkAndExecute function with optimized error handling and metrics
 */
async function executeAutomator(
  automatorAddress: string,
  network: string,
  automatorId: string,
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

  try {
    metrics.executionsTotal++;
    logger.info({ automatorAddress, network }, "Executing automator");

    const wallet = getWallet(network);
    const automator = LocalAutomator__factory.connect(automatorAddress, wallet);

    // Get gas price with backoff retry logic
    const getFeeData = async (): Promise<ethers.FeeData> => {
      try {
        return await wallet.provider.getFeeData();
      } catch (error) {
        if (retryCount < 3) {
          logger.warn(
            { error: error.message },
            "Error getting fee data, retrying..."
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return getFeeData();
        }
        throw error;
      }
    };

    // Execute with optimized gas settings
    const gasEstimate = await automator.checkAndExecute.estimateGas();
    const feeData = await getFeeData();

    // Use legacy gas price for networks that don't support EIP-1559
    const txOptions = feeData.maxFeePerGas
      ? {
          gasLimit: Math.floor(Number(gasEstimate) *1.2), // Add 20% buffer
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          type: 2, // EIP-1559
        }
      : {
          gasLimit: Math.floor(Number(gasEstimate)* 1.2),
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

    // Wait for confirmation
    const receipt = await Promise.race([
      tx.wait(2), // Wait for 2 confirmations
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Transaction confirmation timeout")),
          120000
        )
      ),
    ]);

    // Update metrics
    metrics.executionsSuccess++;
    metrics.gasUsedTotal += receipt?.gasUsed || BigInt(0);

    // Update database
    await prisma.upkeepContract.update({
      where: { id: automatorId },
      data: {
        lastCheckedAt: new Date(),
        checkCount: { increment: 1 },
        lastTxHash: tx.hash,
      },
    });

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
    metrics.executionsFailed++;
    logger.error(
      {
        automatorAddress,
        network,
        error: error.message,
        stack: error.stack,
      },
      "Failed to execute automator"
    );

    // Specific error handling
    if (
      error.code === "INSUFFICIENT_FUNDS" ||
      (error.message && error.message.includes("insufficient funds"))
    ) {
      // Critical error that requires human intervention
      logger.fatal(
        { network, automatorAddress },
        "Insufficient funds for automation"
      );

      // Update DB to mark this automator as having a critical issue
      await prisma.upkeepContract.update({
        where: { id: automatorId },
        data: {
          isActive: false,
          lastError: "INSUFFICIENT_FUNDS",
        },
      });

      // No retry for fund issues
      return false;
    }

    // For other errors, let Bull handle the retry logic
    throw error;
  } finally {
    // Update execution time metrics
    const executionTime = Date.now() - startTime;
    metrics.lastExecutionTime = executionTime;
    metrics.avgExecutionTime =
      (metrics.avgExecutionTime * (metrics.executionsTotal - 1) +
        executionTime) /
      metrics.executionsTotal;

    // Update memory metrics occasionally
    if (metrics.executionsTotal % 10 === 0) {
      updateMemoryMetrics();
    }

    // Remove from running set
    runningExecutions.delete(executionId);

    // Log metrics periodically
    if (metrics.executionsTotal % 50 === 0) {
      logger.info({ metrics }, "Automator service metrics");
    }
  }
}

/**

* Calculate time until next execution
 */
function calculateTimeUntilNextExecution(
  lastCheckedAt: Date | null,
  intervalSeconds: number
): number {
  if (!lastCheckedAt) {
    return 0; // If never checked, execute immediately
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - lastCheckedAt.getTime()) / 1000
  );
  return Math.max(0, intervalSeconds - elapsedSeconds);
}

/**

* Schedule an automator execution using Bull
 */
async function scheduleAutomator(
  automatorId: string,
  delaySeconds: number
): Promise<void> {
  try {
    // Get the automator details
    const automator = await prisma.upkeepContract.findUnique({
      where: { id: automatorId },
    });

    if (!automator || !automator.automatorAddress || !automator.isActive) {
      logger.info(
        { automatorId },
        "Automator not found, not active, or missing address"
      );
      return;
    }

    // Clean up any existing jobs for this automator
    const existingJobs = await automatorQueue.getJobs(['delayed', 'waiting']);
    for (const job of existingJobs) {
      if (job.data.automatorId === automatorId) {
        logger.info({ jobId: job.id, automatorId }, "Removing existing job for automator");
        await job.remove();
      }
    }

    // Create a new job
    const jobData: AutomatorJobData = {
      automatorId,
      automatorAddress: automator.automatorAddress,
      network: automator.network,
      retryCount: 0
    };

    // Add job to queue with delay
    const job = await automatorQueue.add(jobData, {
      delay: delaySeconds * 1000, // Convert to milliseconds
      jobId: `automator:${automator.automatorAddress}:${Date.now()}` // Unique ID
    });

    metrics.queuedJobs++;

    logger.info(
      {
        jobId: job.id,
        automatorAddress: automator.automatorAddress,
        delaySeconds,
        scheduledTime: new Date(Date.now() + delaySeconds * 1000)
      },
      "Scheduled automator execution"
    );
  } catch (error) {
    logger.error(
      { automatorId, error: error.message },
      "Error scheduling automator"
    );
  }
}

/**

* Schedule next execution after completion
 */
async function scheduleNextExecution(automatorId: string): Promise<void> {
  try {
    const automator = await prisma.upkeepContract.findUnique({
      where: { id: automatorId },
    });

    if (!automator || !automator.isActive) {
      logger.info({ automatorId }, "Automator not active, not scheduling next execution");
      return;
    }

    // Schedule for the full interval
    await scheduleAutomator(automatorId, automator.checkInterval);
  } catch (error) {
    logger.error(
      { automatorId, error: error.message },
      "Error scheduling next execution"
    );
  }
}

/**

* Start the Bull processor for automator executions
 */
function startAutomatorProcessor(): void {
  automatorQueue.process(async (job) => {
    const { automatorId, automatorAddress, network, retryCount = 0 } = job.data;

    logger.info(
      { jobId: job.id, automatorAddress, automatorId },
      "Processing automator job"
    );

    try {
      // Execute the automator
      const success = await executeAutomator(
        automatorAddress,
        network,
        automatorId,
        retryCount
      );

      // Schedule next execution if successful
      if (success) {
        await scheduleNextExecution(automatorId);
      }

      return { success };
    } catch (error) {
      // Update DB with error
      await prisma.upkeepContract.update({
        where: { id: automatorId },
        data: {
          lastError: error.message?.substring(0, 255) || "Unknown error",
        },
      });

      // Increment retry count for next attempt
      job.data.retryCount = (retryCount || 0) + 1;

      // Rethrow to trigger Bull's retry mechanism
      throw error;
    }
  });

  // Listen for completed jobs
  automatorQueue.on('completed', (job, result) => {
    metrics.queuedJobs--;
    logger.info(
      { jobId: job.id, automatorId: job.data.automatorId, success: result.success },
      "Job completed successfully"
    );
  });

  // Listen for failed jobs
  automatorQueue.on('failed', (job, error) => {
    metrics.queuedJobs--;
    logger.error(
      { jobId: job.id, automatorId: job.data.automatorId, error: error.message },
      "Job failed"
    );

    // Schedule next execution anyway, but with a delay
    // This is our fallback in case Bull's retry mechanism doesn't work
    if (job.attemptsMade >= job.opts.attempts!) {
      logger.info(
        { jobId: job.id, automatorId: job.data.automatorId, attempts: job.attemptsMade },
        "Max retry attempts reached, scheduling next execution with delay"
      );

      // Schedule with default interval
      scheduleNextExecution(job.data.automatorId).catch(e => {
        logger.error(
          { error: e.message, automatorId: job.data.automatorId },
          "Error scheduling next execution after failure"
        );
      });
    }
  });

  logger.info("Automator job processor started");
}

/**

* Start the dynamic scheduler using Bull
 */
export async function startDynamicScheduler(): Promise<() => void> {
  logger.info("Starting Bull-based automator scheduler");

  try {
    // Start the job processor
    startAutomatorProcessor();

    // Get all active automators
    const activeAutomators = await prisma.upkeepContract.findMany({
      where: {
        isActive: true,
        automatorDeployed: true,
        automatorAddress: { not: null },
      },
    });

    logger.info(
      { count: activeAutomators.length },
      "Found active automators"
    );

    // Schedule each automator
    for (const automator of activeAutomators) {
      if (!automator.automatorAddress) continue;

      const secondsUntilNextExecution = calculateTimeUntilNextExecution(
        automator.lastCheckedAt,
        automator.checkInterval
      );

      await scheduleAutomator(automator.id, secondsUntilNextExecution);
    }

    // Setup database watcher for new automators
    const dbWatcherQueue = new Bull('db-watcher', {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        repeat: {
          every: 30000 // 30 seconds
        }
      }
    });

    // Process database watcher jobs
    dbWatcherQueue.process(async () => {
      try {
        // Check for new automators
        const latestAutomators = await prisma.upkeepContract.findMany({
          where: {
            isActive: true,
            automatorDeployed: true,
            automatorAddress: { not: null },
          },
        });

        // Get list of scheduled automators
        const scheduledJobs = await automatorQueue.getJobs(['delayed', 'waiting', 'active']);
        const scheduledAutomatorIds = new Set(
          scheduledJobs.map(job => job.data.automatorId)
        );

        // Find automators that aren't scheduled yet
        for (const automator of latestAutomators) {
          if (!scheduledAutomatorIds.has(automator.id)) {
            logger.info(
              {
                automatorAddress: automator.automatorAddress,
                contractAddress: automator.contractAddress,
              },
              "Found new automator to schedule"
            );

            const secondsUntilNextExecution = calculateTimeUntilNextExecution(
              automator.lastCheckedAt,
              automator.checkInterval
            );

            await scheduleAutomator(automator.id, secondsUntilNextExecution);
          }
        }

        // Update memory metrics
        updateMemoryMetrics();
        
        return { checked: latestAutomators.length };
      } catch (error) {
        logger.error({ error: error.message }, "Error in DB watcher");
        throw error;
      }
    });

    // Add watcher job if it doesn't exist
    const watcherJobs = await dbWatcherQueue.getRepeatableJobs();
    if (watcherJobs.length === 0) {
      await dbWatcherQueue.add({}, {
        repeat: { every: 30000 }, // 30 seconds
        jobId: 'db-watcher'
      });
    }

    // Return cleanup function
    return async () => {
      logger.info("Stopping Bull-based scheduler");

      // Close all queues
      await Promise.all([
        automatorQueue.close(),
        dbWatcherQueue.close()
      ]);

      // Close all providers
      Object.entries(providers).forEach(([network, provider]) => {
        logger.info({ network }, "Disconnecting provider");
        if ("destroy" in provider) {
          (provider as any).destroy();
        }
      });

      logger.info("Bull-based scheduler stopped");
    };
  } catch (error) {
    logger.error(
      { error: error.message },
      "Failed to start Bull-based scheduler"
    );
    throw error;
  }
}

// Export for PM2 metrics monitoring
export function getMetrics(): Metrics {
  updateMemoryMetrics();
  return metrics;
}

// Export health check endpoint data
export function getHealthStatus(): any {
  return {
    status: "ok",
    uptime: process.uptime(),
    queueInfo: {
      waiting: automatorQueue.getWaitingCount(),
      active: automatorQueue.getActiveCount(),
      completed: automatorQueue.getCompletedCount(),
      failed: automatorQueue.getFailedCount(),
      delayed: automatorQueue.getDelayedCount()
    },
    metrics: {
      ...metrics,
      gasUsedTotal: metrics.gasUsedTotal.toString(),
      memoryUsage: {
        rss: Math.round(metrics.memoryUsage.rss / 1024 / 1024) + "MB",
        heapTotal:
          Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024) + "MB",
        heapUsed:
          Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024) + "MB",
        external:
          Math.round(metrics.memoryUsage.external / 1024 / 1024) + "MB",
      },
    },
  };
}

```

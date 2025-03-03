```ts

// src/services/automator-service.ts
import { ethers } from "ethers";
import { LocalAutomator__factory } from "../typechain";
import { prisma } from "../lib/prisma";
import pino from "pino";
import os from "os";

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
}

// Global runtime metrics
const metrics: Metrics = {
 executionsTotal: 0,
 executionsSuccess: 0,
 executionsFailed: 0,
 lastExecutionTime: 0,
 avgExecutionTime: 0,
 gasUsedTotal: 0n,
 memoryUsage: process.memoryUsage(),
};

// Store all active timers by automator address
const automatorTimers: Record<string, NodeJS.Timeout> = {};

// Track running executions to avoid overlaps
const runningExecutions = new Set<string>();

/**
 * Update memory usage metrics
 */
function updateMemoryMetrics(): void {
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
   rpcUrl = "http://localhost:8545";
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
  if (Object.values(automatorTimers).length > 0) {
   setTimeout(() => {
    logger.info({ network }, "Attempting to reconnect provider");
    getProvider(network);
   }, 5000);
  }
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
  throw new Error(
   "DEPLOYER_PRIVATE_KEY environment variable is not defined"
  );
 }

 return new ethers.Wallet(privateKey, provider);
}

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

 try {
  metrics.executionsTotal++;
  logger.info({ automatorAddress, network }, "Executing automator");

  const wallet = getWallet(network);
  const automator = LocalAutomator__factory.connect(
   automatorAddress,
   wallet
  );

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
  metrics.gasUsedTotal += receipt?.gasUsed || 0n;

  // Update database
  await prisma.upkeepContract.update({
   where: { automatorAddress },
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
    { network, wallet: wallet.address },
    "Insufficient funds for automation"
   );

   // Update DB to mark this automator as having a critical issue
   await prisma.upkeepContract.update({
    where: { automatorAddress },
    data: {
     isActive: false,
     lastError: "INSUFFICIENT_FUNDS",
    },
   });

   // No retry for fund issues
   return false;
  }

  // Retry for transient errors
  const RETRYABLE_ERRORS = [
   "NETWORK_ERROR",
   "TIMEOUT",
   "CALL_EXCEPTION",
   "SERVER_ERROR",
   "UNPREDICTABLE_GAS_LIMIT",
  ];

  const isRetryable = RETRYABLE_ERRORS.some(
   (code) =>
    error.code === code ||
    (error.message && error.message.includes(code))
  );

  if (retryCount < 3 && isRetryable) {
   const delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
   logger.info(
    { automatorAddress, retryCount, delay },
    "Scheduling retry"
   );

   // Use setTimeout for retry to avoid blocking
   setTimeout(() => {
    executeAutomator(automatorAddress, network, retryCount + 1).catch(
     (e) => logger.error({ error: e.message }, "Error in retry")
    );
   }, delay);
  } else {
   // Update DB with error
   await prisma.upkeepContract.update({
    where: { automatorAddress },
    data: {
     lastError: error.message?.substring(0, 255) || "Unknown error",
    },
   });
  }

  return false;
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
 * Schedule the next execution for a specific automator
 */
async function scheduleAutomator(
 automatorId: string,
 intervalSeconds: number
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

  // Clear any existing timer
  if (automatorTimers[automator.automatorAddress]) {
   clearTimeout(automatorTimers[automator.automatorAddress]);
   delete automatorTimers[automator.automatorAddress];
  }

  logger.info(
   {
    automatorAddress: automator.automatorAddress,
    intervalSeconds,
   },
   "Scheduling automator execution"
  );

  // Schedule the execution
  automatorTimers[automator.automatorAddress] = setTimeout(async () => {
   try {
    // Execute the automator
    const success = await executeAutomator(
     automator.automatorAddress!,
     automator.network
    );

    // Reschedule for the next interval
    scheduleAutomator(automator.id, automator.checkInterval);
   } catch (error) {
    logger.error(
     {
      automatorAddress: automator.automatorAddress,
      error: error.message,
     },
     "Error in automator execution"
    );

    // Reschedule even on error, with shorter interval for retries
    const retryInterval = Math.min(
     60,
     Math.max(10, Math.floor(intervalSeconds / 6))
    );
    scheduleAutomator(automator.id, retryInterval);
   }
  }, intervalSeconds * 1000);
 } catch (error) {
  logger.error(
   { automatorId, error: error.message },
   "Error scheduling automator"
  );
 }
}

/**
 * Start the dynamic scheduler
 */
export async function startDynamicScheduler(): Promise<() => void> {
 logger.info("Starting dynamic automator scheduler");

 try {
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

  // Setup dtatabase watcher for new automators or updaes
  const dbWatcherInterval = setInterval(async () => {
   try {
    // Check for new or updated automators
    const latestAutomators = await prisma.upkeepContract.findMany({
     where: {
      isActive: true,
      automatorDeployed: true,
      automatorAddress: { not: null },
     },
    });

    // Find automators that aren't scheduled yet
    for (const automator of latestAutomators) {
     if (
      !automator.automatorAddress ||
      automatorTimers[automator.automatorAddress]
     )
      continue;

     logger.info(
      {
       automatorAddress: automator.automatorAddress,
       contract: automator.contractAddress,
      },
      "Found new automator to schedule"
     );

     const secondsUntilNextExecution =
      calculateTimeUntilNextExecution(
       automator.lastCheckedAt,
       automator.checkInterval
      );

     await scheduleAutomator(automator.id, secondsUntilNextExecution);
    }

    // Update memory metrics
    updateMemoryMetrics();
   } catch (error) {
    logger.error({ error: error.message }, "Error in DB watcher");
   }
  }, 30000); // Check every 30 seconds

  // Return cleanup function
  return () => {
   logger.info("Stopping dynamic scheduler");

   // Clear all timers
   Object.entries(automatorTimers).forEach(([address, timer]) => {
    logger.info({ automatorAddress: address }, "Clearing timer");
    clearTimeout(timer);
   });

   // Clear the db watcher
   clearInterval(dbWatcherInterval);

   // Close all providers
   Object.entries(providers).forEach(([network, provider]) => {
    logger.info({ network }, "Disconnecting provider");
    if ("destroy" in provider) {
     (provider as any).destroy();
    }
   });

   logger.info("Dynamic scheduler stopped");
  };
 } catch (error) {
  logger.error(
   { error: error.message },
   "Failed to start dynamic scheduler"
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


// src/automator-runner.ts
import { startDynamicScheduler, getHealthStatus } from './services/automator-service';
import { prisma } from './lib/prisma';
import express from 'express';
import pino from 'pino';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

// Optional: Create a tiny HTTP server for PM2 monitoring and health checks
const monitoringPort = process.env.MONITORING_PORT || 9999;
const app = express();

// Store cleanup function
let stopScheduler: (() => void) | null = null;

/**
 * Main function to start the automator service
 */
async function main() {
  logger.info('Starting automator service...');
  
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Connected to database');
    
    // Setup metrics/health API (only accessible locally)
    app.get('/health', (req, res) => {
      res.json(getHealthStatus());
    });
    
    app.get('/metrics', (req, res) => {
      res.json({ metrics: getHealthStatus().metrics });
    });
    
    // Start listening on monitoring port
    app.listen(monitoringPort, '127.0.0.1', () => {
      logger.info(`Monitoring server running on port ${monitoringPort}`);
    });
    
    // Start the scheduler
    stopScheduler = await startDynamicScheduler();
    logger.info('Automator service running');
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception');
      await gracefulShutdown();
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      logger.fatal({ 
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined
      }, 'Unhandled rejection');
      await gracefulShutdown();
      process.exit(1);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    
    // Log periodic health checks
    setInterval(() => {
      const health = getHealthStatus();
      logger.info({ 
        uptime: health.uptime, 
        executionsTotal: health.metrics.executionsTotal,
        successRate: (health.metrics.executionsSuccess / Math.max(1, health.metrics.executionsTotal) * 100).toFixed(2) + '%',
        memoryRSS: health.metrics.memoryUsage.rss
      }, 'Health check');
    }, 60000); // Every minute
    
  } catch (error) {
    logger.fatal({ error: error.message }, 'Failed to start automator service');
    process.exit(1);
  }
}

/**
 * Graceful shutdown function
 */
async function gracefulShutdown() {
  logger.info('Graceful shutdown initiated');
  
  try {
    // Stop the scheduler
    if (stopScheduler) {
      stopScheduler();
      logger.info('Scheduler stopped');
    }
    
    // Close database connection
    await prisma.$disconnect();
    logger.info('Database disconnected');
    
    logger.info('Shutdown complete');
  } catch (error) {
    logger.error({ error: error.message }, 'Error during shutdown');
  }
  
  process.exit(0);
}

// Start the service
main().catch(error => {
  logger.fatal({ error: error.message }, 'Fatal error in main thread');
  process.exit(1);
});


// ecosystem.config.js
module.exports = {
  apps: [
    // Main API server
    {
      name: 'api-server',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    
    // Automator service
    {
      name: 'blockchain-automator',
      script: 'dist/automator-runner.js',
      instances: 1, // Single instance to avoid duplicate executions
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024', // Control memory usage
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        MONITORING_PORT: 9999,
        LOG_LEVEL: 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      },
      env_development: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug'
      }
    }
  ]
};

```

You're right - I should provide a TypeScript version since your project is using TypeScript. Here's an improved version with specific optimizations for PM2:

I've created a comprehensive PM2-optimized implementation for your automator service with TypeScript. This approach includes many performance and reliability improvements specifically for running as a separate PM2 process:

## 1. Key PM2 Optimizations

### Resource Management

- **Memory Monitoring**: Continuously monitors heap usage and can trigger GC when needed
- **Execution Metrics**: Tracks gas usage, success rates, and execution times
- **Health Endpoint**: Provides PM2 with real-time status information

### Reliability Features

- **Connection Pooling**: Reuses providers instead of creating new connections
- **Exponential Backoff**: Gradually increases retry delays after failures
- **Execution Tracking**: Prevents overlapping executions of the same automator
- **Graceful Shutdown**: Properly closes all connections when PM2 stops the process

### Performance Improvements

- **Structured Logging**: Uses pino for high-performance JSON logging
- **Optimized Gas Estimation**: Adds appropriate buffers while minimizing costs
- **Error Classification**: Distinguishes between retryable and non-retryable errors

## 2. PM2 Configuration

The `ecosystem.config.js` file provides PM2-specific settings:

```javascript
{
  name: 'blockchain-automator',
  instances: 1, // Single instance to avoid duplicate executions
  autorestart: true,
  max_memory_restart: '1G',
  node_args: '--max-old-space-size=1024',
  exp_backoff_restart_delay: 100,
  // Environment variables...
}
```

## 3. Running the Service

To start the automator service:

```bash
# Build TypeScript first
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Monitor the service
pm2 monit
pm2 logs blockchain-automator

# Check metrics (if monitoring server is enabled)
curl http://localhost:9999/health
```

## 4. Advantages Over Express Integration

This implementation:

- **Isolates blockchain operations** from your API server
- **Provides dedicated resources** for automator execution
- **Prevents event loop blocking** in your API
- **Improves restart behavior** with PM2's sophisticated restart policies
- **Enables detailed monitoring** through PM2's dashboard

The automator service will run independently, with its own resource allocation, error handling, and monitoring, providing much better performance and reliability than embedding it in your Express server.

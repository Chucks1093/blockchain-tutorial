import { logger } from "../lib/logger";
import { prisma } from "../lib/prisma";
import Bull from "bull";
// Automator execution job data format
interface AutomatorJobData {
	automatorId: string;
	automatorAddress: string;
	network: string;
	retryCount?: number;
}

const automatorQueue = new Bull<AutomatorJobData>("automator-execution", {
	redis: {
		host: process.env.REDIS_HOST || "localhost",
		port: parseInt(process.env.REDIS_PORT || "6379"),
		password: process.env.REDIS_PASSWORD,
	},
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 5000, // 5 seconds initial delay
		},
		removeOnComplete: 100, // Keep last 100 completed jobs
		removeOnFail: 200, // Keep last 200 failed jobs
	},
});
async function startScript() {
	try {
		await prisma.$connect();
		logger.info("Connected to database");
	} catch (error) {
		console.error("Failed to start server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
}
// Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
	logger.fatal(
		{ error: error.message, stack: error.stack },
		"Uncaught exception"
	);
	await shutDownProcess();
	process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
	logger.fatal(
		{
			reason: reason instanceof Error ? reason.message : String(reason),
			stack: reason instanceof Error ? reason.stack : undefined,
		},
		"Unhandled rejection"
	);
	await shutDownProcess();
	process.exit(1);
});

process.on("SIGINT", async () => {
	await shutDownProcess();
	process.exit(0);
});

const shutDownProcess = async () => {
	logger.info("Disconnecting Database...");
	await prisma.$disconnect();
};

startScript();

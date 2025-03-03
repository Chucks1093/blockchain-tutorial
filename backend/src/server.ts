import app from "./app";
import {
	onChainEventListeners,
	initializeEventHandlers,
} from "./automation/automation.events";

import { config } from "./config";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

// Store cleanup function so we can call it on shutdown
let stopListening: (() => void) | null = null;

async function startServer() {
	try {
		await prisma.$connect();
		stopListening = await onChainEventListeners();
		logger.info("Connected to database");
		initializeEventHandlers();

		app.listen(3000, () => {
			console.log(`Server running on port ${config.port}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
}

process.on("SIGINT", async () => {
	// Stop the event listener if it's running
	if (stopListening) {
		stopListening();
		logger.info("📡 Event listener stopped");
	}
	await prisma.$disconnect();
	console.log("💾 Database connection closed");

	console.log("👋 Shutdown complete");
	process.exit(0);
});

startServer();

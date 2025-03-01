import app from "./app";
import { onChainEventListeners } from "./automation/automation.service";
import { config } from "./config";
import { prisma } from "./lib/prisma";

// Store cleanup function so we can call it on shutdown
let stopListening: (() => void) | null = null;

async function startServer() {
	try {
		await prisma.$connect();
		stopListening = await onChainEventListeners();
		console.log("Connected to database");

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
		console.log("📡 Event listener stopped");
	}
	await prisma.$disconnect();
	console.log("💾 Database connection closed");

	console.log("👋 Shutdown complete");
	process.exit(0);
});

startServer();

import app from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";

async function startServer() {
	try {
		// Test database connection
		await prisma.$connect();
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

startServer();

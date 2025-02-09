import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

interface EnvConfig {
	[key: string]: string;
}

// Get the contract address from command line arguments
const contractAddress = process.argv[2];

if (!contractAddress) {
	console.error("No contract address provided");
	process.exit(1);
}

// Path to the contract project's .env file (one directory up from frontend)
const envPath = path.resolve(__dirname, "/../.env");

// Function to update or create .env file
async function updateEnvFile(): Promise<void> {
	try {
		let envConfig: EnvConfig = {};

		// Read existing .env file if it exists
		if (fs.existsSync(envPath)) {
			const existingEnv = dotenv.config({ path: envPath });
			if (existingEnv.parsed) {
				envConfig = existingEnv.parsed;
			}
		}

		// Update or add the MULTISIG_ADDRESS
		envConfig.MULTISIG_ADDRESS = contractAddress;

		// Convert config object to string
		const envContent = Object.entries(envConfig)
			.map(([key, value]) => `${key}=${value}`)
			.join("\n");

		// Write to .env file
		fs.writeFileSync(envPath, envContent + "\n");

		console.log(
			"Successfully updated .env file with contract address:",
			contractAddress
		);
		console.log("ENV file location:", envPath);
	} catch (error) {
		console.error(
			"Error updating .env file:",
			error instanceof Error ? error.message : String(error)
		);
		process.exit(1);
	}
}

updateEnvFile();

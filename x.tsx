// src/models/automation.model.ts
import { ethers } from "ethers";
import { prisma } from "../lib/prisma";

// Types
export interface CreateUpkeepInput {
	contractAddress: string;
	name: string;
	network?: string;
	isActive?: boolean;
}

export interface UpkeepCheckResult {
	upkeepNeeded: boolean;
	performData: string;
}

// ABI for the upkeep interface
const UPKEEP_ABI = [
	"function checkUpkeep(bytes) external returns (bool upkeepNeeded, bytes performData)",
	"function performUpkeep(bytes) external",
];

// Model methods
export const automationModel = {
	// Create a new upkeep contract entry
	async createUpkeep(data: CreateUpkeepInput) {
		return prisma.upkeepContract.create({
			data: {
				contractAddress: data.contractAddress,
				name: data.name,
				network: data.network || "mainnet",
				isActive: data.isActive !== undefined ? data.isActive : true,
				createdAt: new Date(),
			},
		});
	},

	// Get a single upkeep by contract address
	async getUpkeepByAddress(contractAddress: string) {
		return prisma.upkeepContract.findUnique({
			where: { contractAddress },
		});
	},

	// Get all upkeeps with optional filters
	async getAllUpkeeps(isActive?: boolean) {
		const where = isActive !== undefined ? { isActive } : {};
		return prisma.upkeepContract.findMany({
			where,
			orderBy: { createdAt: "desc" },
		});
	},

	// Update upkeep information
	async updateUpkeep(
		contractAddress: string,
		data: Partial<CreateUpkeepInput>
	) {
		return prisma.upkeepContract.update({
			where: { contractAddress },
			data,
		});
	},

	// Delete an upkeep
	async deleteUpkeep(contractAddress: string) {
		return prisma.upkeepContract.delete({
			where: { contractAddress },
		});
	},

	// Get provider for network
	getProvider(network: string) {
		switch (network.toLowerCase()) {
			case "mainnet":
				return new ethers.providers.JsonRpcProvider(
					process.env.MAINNET_RPC_URL
				);
			case "goerli":
				return new ethers.providers.JsonRpcProvider(
					process.env.GOERLI_RPC_URL
				);
			case "sepolia":
				return new ethers.providers.JsonRpcProvider(
					process.env.SEPOLIA_RPC_URL
				);
			default:
				throw new Error(`Unsupported network: ${network}`);
		}
	},

	// Check upkeep for a single contract
	async checkUpkeep(
		contractAddress: string,
		network: string
	): Promise<UpkeepCheckResult> {
		const provider = this.getProvider(network);
		const contract = new ethers.Contract(
			contractAddress,
			UPKEEP_ABI,
			provider
		);

		// Call checkUpkeep with empty bytes
		const [upkeepNeeded, performData] = await contract.checkUpkeep("0x");

		// Update the database with check result
		await prisma.upkeepContract.update({
			where: { contractAddress },
			data: {
				lastCheckedAt: new Date(),
				checkCount: { increment: 1 },
				lastStatus: upkeepNeeded ? "NEEDS_UPKEEP" : "NO_UPKEEP_NEEDED",
			},
		});

		return { upkeepNeeded, performData };
	},

	// Get all active contracts and perform upkeep checks
	async checkAllUpkeeps() {
		const activeContracts = await prisma.upkeepContract.findMany({
			where: { isActive: true },
		});

		const results = await Promise.allSettled(
			activeContracts.map((contract) =>
				this.checkUpkeep(contract.contractAddress, contract.network).catch(
					(error) => {
						// Update with error status
						prisma.upkeepContract.update({
							where: { contractAddress: contract.contractAddress },
							data: {
								lastCheckedAt: new Date(),
								checkCount: { increment: 1 },
								lastStatus: `ERROR: ${error.message}`,
							},
						});
						throw error;
					}
				)
			)
		);

		return {
			totalChecked: activeContracts.length,
			succeeded: results.filter((r) => r.status === "fulfilled").length,
			failed: results.filter((r) => r.status === "rejected").length,
		};
	},
};

// src/controllers/automation.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { automationModel, CreateUpkeepInput } from "../models/automation.model";

// Validation schema for create/update requests
const UpkeepSchema = z.object({
	contractAddress: z.string().startsWith("0x"),
	name: z.string().min(1),
	network: z.string().default("mainnet"),
	isActive: z.boolean().default(true),
});

// Controller methods
export const automationController = {
	// Create a new upkeep contract
	async createUpkeep(req: Request, res: Response) {
		try {
			// Validate request body
			const validatedData = UpkeepSchema.parse(req.body);

			// Check if contract already exists
			const existingContract = await automationModel.getUpkeepByAddress(
				validatedData.contractAddress
			);

			if (existingContract) {
				return res.status(409).json({
					success: false,
					message: "Contract with this address already exists",
					data: existingContract,
				});
			}

			// Create new upkeep contract
			const newUpkeep = await automationModel.createUpkeep(
				validatedData as CreateUpkeepInput
			);

			return res.status(201).json({
				success: true,
				message: "Upkeep contract registered successfully",
				data: newUpkeep,
			});
		} catch (error) {
			console.error("Failed to create upkeep:", error);

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					message: "Invalid request data",
					errors: error.errors,
				});
			}

			return res.status(500).json({
				success: false,
				message: "Failed to register upkeep contract",
			});
		}
	},

	// Get all upkeeps
	async getAllUpkeeps(req: Request, res: Response) {
		try {
			const isActive =
				req.query.active === "true"
					? true
					: req.query.active === "false"
					? false
					: undefined;

			const upkeeps = await automationModel.getAllUpkeeps(isActive);

			return res.status(200).json({
				success: true,
				count: upkeeps.length,
				data: upkeeps,
			});
		} catch (error) {
			console.error("Failed to fetch upkeeps:", error);

			return res.status(500).json({
				success: false,
				message: "Failed to fetch upkeeps",
			});
		}
	},

	// Get upkeep by contract address
	async getUpkeepByAddress(req: Request, res: Response) {
		try {
			const { address } = req.params;

			const upkeep = await automationModel.getUpkeepByAddress(address);

			if (!upkeep) {
				return res.status(404).json({
					success: false,
					message: "Upkeep contract not found",
				});
			}

			return res.status(200).json({
				success: true,
				data: upkeep,
			});
		} catch (error) {
			console.error(`Failed to get upkeep:`, error);

			return res.status(500).json({
				success: false,
				message: "Failed to get upkeep contract",
			});
		}
	},

	// Update upkeep by contract address
	async updateUpkeep(req: Request, res: Response) {
		try {
			const { address } = req.params;

			// Validate request body (partial validation)
			const validatedData = UpkeepSchema.partial().parse(req.body);

			// Check if contract exists
			const existingContract = await automationModel.getUpkeepByAddress(
				address
			);

			if (!existingContract) {
				return res.status(404).json({
					success: false,
					message: "Upkeep contract not found",
				});
			}

			// Update upkeep
			const updatedUpkeep = await automationModel.updateUpkeep(
				address,
				validatedData
			);

			return res.status(200).json({
				success: true,
				message: "Upkeep contract updated successfully",
				data: updatedUpkeep,
			});
		} catch (error) {
			console.error("Failed to update upkeep:", error);

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					message: "Invalid request data",
					errors: error.errors,
				});
			}

			return res.status(500).json({
				success: false,
				message: "Failed to update upkeep contract",
			});
		}
	},

	// Delete upkeep by contract address
	async deleteUpkeep(req: Request, res: Response) {
		try {
			const { address } = req.params;

			// Check if contract exists
			const existingContract = await automationModel.getUpkeepByAddress(
				address
			);

			if (!existingContract) {
				return res.status(404).json({
					success: false,
					message: "Upkeep contract not found",
				});
			}

			// Delete upkeep
			await automationModel.deleteUpkeep(address);

			return res.status(200).json({
				success: true,
				message: "Upkeep contract deleted successfully",
			});
		} catch (error) {
			console.error("Failed to delete upkeep:", error);

			return res.status(500).json({
				success: false,
				message: "Failed to delete upkeep contract",
			});
		}
	},

	// Manually check a single upkeep
	async checkUpkeep(req: Request, res: Response) {
		try {
			const { address } = req.params;

			// Check if contract exists
			const existingContract = await automationModel.getUpkeepByAddress(
				address
			);

			if (!existingContract) {
				return res.status(404).json({
					success: false,
					message: "Upkeep contract not found",
				});
			}

			// Perform check
			const result = await automationModel.checkUpkeep(
				address,
				existingContract.network
			);

			// Get updated contract with new status
			const updatedContract = await automationModel.getUpkeepByAddress(
				address
			);

			return res.status(200).json({
				success: true,
				message: "Upkeep check performed successfully",
				data: {
					upkeepNeeded: result.upkeepNeeded,
					contract: updatedContract,
				},
			});
		} catch (error) {
			console.error("Failed to check upkeep:", error);

			return res.status(500).json({
				success: false,
				message: `Failed to check upkeep: ${error.message}`,
			});
		}
	},

	// Run upkeep checks for all active contracts
	async checkAllUpkeeps(_req: Request, res: Response) {
		try {
			const results = await automationModel.checkAllUpkeeps();

			return res.status(200).json({
				success: true,
				message: "Upkeep checks completed",
				data: results,
			});
		} catch (error) {
			console.error("Failed to run upkeep checks:", error);

			return res.status(500).json({
				success: false,
				message: "Failed to run upkeep checks",
			});
		}
	},
};

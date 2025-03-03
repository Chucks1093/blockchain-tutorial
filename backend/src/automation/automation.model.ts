import { ActivityType } from "@prisma/client";
import { logger } from "../lib/logger";
import { prisma } from "../lib/prisma";
import {
	ExecStatus,
	UpkeepHistoryCreate,
	UpkeepHistoryQuery,
	UpkeepRequest,
} from "./automation.schema";

export const getUpKeepByAddress = async (contractAddress: string) => {
	const upKeep = prisma.upkeepContract.findUnique({
		where: { contractAddress },
	});
	return upKeep;
};

export const createUpKeep = async (input: UpkeepRequest) => {
	const upKeep = prisma.upkeepContract.create({
		data: {
			contractAddress: input.contractAddress,
			name: input.name,
			network: input.network || "anvil",
			isActive: true,
			createdAt: new Date(),
			owner: input.owner,
			automatorAddress: "",
		},
	});
	return upKeep;
};

export const getAllUpKeeps = async (isActive?: boolean) => {
	const where = isActive !== undefined ? { isActive } : {};

	const upKeeps = prisma.upkeepContract.findMany({
		where,
		orderBy: {
			createdAt: "desc",
		},
	});
	return upKeeps;
};

export const createHistoryEntry = async (data: UpkeepHistoryCreate) => {
	try {
		const historyEntry = await prisma.upkeepHistory.create({
			data: {
				...data,
				createdAt: new Date(),
			},
		});
		return historyEntry;
	} catch (error) {
		logger.error(error, "Failed to create upkeep history entry");
		throw new Error("Failed to create history entry:");
	}
};

export const recordCheckAndExecute = (
	upkeepId: string,
	contractAddress: string,
	automatorAddress: string,
	status: ExecStatus,
	upkeepPerformed: boolean,
	txHash?: string,
	blockNumber?: number,
	gasUsed?: bigint,
	errorMessage?: string
) => {
	return createHistoryEntry({
		upkeepId,
		contractAddress,
		automatorAddress,
		txHash,
		blockNumber,
		gasUsed: gasUsed ? gasUsed.toString() : undefined,
		activityType: "CHECK_EXECUTE",
		status,
		upkeepPerformed,
		errorMessage,
	});
};

export const recordFunding = (
	upkeepId: string,
	contractAddress: string,
	linkAmount: string,
	status: ExecStatus,
	txHash?: string,
	errorMessage?: string
) => {
	return createHistoryEntry({
		upkeepId,
		contractAddress,
		linkAmount,
		txHash,
		activityType: "FUND",
		status,
		upkeepPerformed: false,
		errorMessage,
	});
};

export const getHistory = async (query: UpkeepHistoryQuery) => {
	try {
		const where: Partial<UpkeepHistoryCreate> = {};
		if (query.upkeepId) {
			where.upkeepId = query.upkeepId;
		}

		if (query.contractAddress) {
			where.contractAddress = query.contractAddress;
		}
		const history = await prisma.upkeepHistory.findMany({
			where,
			orderBy: { createdAt: "desc" },
		});
		return history;
	} catch (error) {
		logger.error(error, "Failed to get upkeep history");
		throw new Error("Failed to get History");
	}
};

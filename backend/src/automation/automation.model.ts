import { prisma } from "../lib/prisma";
import { z } from "zod";

export const UpKeepSchema = z.object({
	contractAddress: z.string().startsWith("0x"),
	name: z.string().min(2),
	network: z.string().default("anvil"),
	isActive: z.boolean(),
});

type UpkeepRequest = z.infer<typeof UpKeepSchema>;

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

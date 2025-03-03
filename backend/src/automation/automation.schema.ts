// src/schemas/upkeep-history.schema.ts
import { z } from "zod";

export interface Metrics {
	executionsTotal: number;
	executionsSuccess: number;
	executionsFailed: number;
	lastExecutionTime: number;
	avgExecutionTime: number;
	gasUsedTotal: bigint;
	memoryUsage: NodeJS.MemoryUsage;
}

// Enum values matching the Prisma schema
export const ActivityTypeEnum = z.enum([
	"CHECK_EXECUTE",
	"FUND",
	"REGISTER",
	"CANCEL",
	"WITHDRAW",
]);

export const ExecStatusEnum = z.enum([
	"PENDING",
	"SUCCESS",
	"REVERTED",
	"ERROR",
	"SKIPPED",
]);

export const UpKeepSchema = z.object({
	contractAddress: z.string().startsWith("0x"),
	name: z.string().min(2),
	interval: z.number().int().positive().default(300),
	network: z.string().default("anvil"),
	isActive: z.boolean().default(true),
	owner: z.string().startsWith("0x"),
});

// Schema for creating a new upkeep history entry
export const UpkeepHistoryCreateSchema = z.object({
	upkeepId: z.string().uuid(),
	contractAddress: z.string().startsWith("0x"),
	automatorAddress: z.string().startsWith("0x").optional(),
	txHash: z.string().startsWith("0x").optional(),
	blockNumber: z.number().int().positive().optional(),
	gasUsed: z.string().optional(), // Store as string to handle BigInt
	linkAmount: z.string().optional(), // Store as string to handle decimal values
	activityType: ActivityTypeEnum,
	status: ExecStatusEnum,
	upkeepPerformed: z.boolean(),
	errorMessage: z.string().optional(),
});

// Schema for querying upkeep history with filters
export const UpkeepHistoryQuerySchema = z.object({
	upkeepId: z.string().uuid().optional(),
	contractAddress: z.string().startsWith("0x").optional(),
	txHash: z.string().startsWith("0x").optional(),
	activityType: ActivityTypeEnum.optional(),
	status: ExecStatusEnum.optional(),
	upkeepPerformed: z.boolean().optional(),
	fromDate: z.string().datetime().optional(), // ISO datetime string
	toDate: z.string().datetime().optional(), // ISO datetime string
	limit: z.number().int().positive().max(100).default(20),
	offset: z.number().int().nonnegative().default(0),
});

// Type based on the schema
export type ExecStatus = z.infer<typeof ExecStatusEnum>;

export type UpkeepRequest = z.infer<typeof UpKeepSchema>;

export type UpkeepHistoryCreate = z.infer<typeof UpkeepHistoryCreateSchema>;

export type UpkeepHistoryQuery = z.infer<typeof UpkeepHistoryQuerySchema>;

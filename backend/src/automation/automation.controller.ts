import { Request, Response } from "express";
import { z } from "zod";
import {
	createUpKeep,
	getAllUpKeeps,
	getUpKeepByAddress,
} from "./automation.model";
import { deployAutmator } from "./automation.service";
import { UpKeepSchema } from "./automation.schema";

type Controller = Promise<any>;

export const httpCreateUpKeep = async (
	req: Request,
	res: Response
): Controller => {
	try {
		const validatedData = UpKeepSchema.parse(req.body);
		const existingContract = await getUpKeepByAddress(
			validatedData.contractAddress
		);

		if (existingContract) {
			return res.status(409).json({
				success: false,
				message: `Contract with this address ${existingContract.contractAddress} already exists`,
				data: existingContract,
			});
		}
		const newUpKeep = await createUpKeep(validatedData);

		await deployAutmator(
			validatedData.contractAddress,
			validatedData.interval,
			validatedData.owner
		);

		res.status(201).json({
			success: true,
			message: "Upkeep contract registered successfully",
			data: newUpKeep,
		});
	} catch (error) {
		console.error("Failed to create upkeep:", error);

		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				message: "Invalid request data",
				error: error.errors,
			});
		}

		res.status(500).json({
			success: false,
			message: "Failed to register upkeep contract",
		});
	}
};

export const httpGetAllUpKeep = async (
	req: Request,
	res: Response
): Controller => {
	try {
		const isActive =
			req.query.active === "true"
				? true
				: req.query.active === "false"
				? false
				: undefined;
		const upKeeps = await getAllUpKeeps(isActive);

		return res.status(200).json({
			success: true,
			message: "Upkeeps retrieved",
			data: upKeeps,
		});
	} catch (error) {
		console.error("Failed to run upkeep checks", error);

		res.status(500).json({
			success: false,
			message: "Failed to run upkeep checks",
		});
	}
};

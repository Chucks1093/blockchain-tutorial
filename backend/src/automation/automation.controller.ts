import { Request, Response } from "express";
import { z } from "zod";
import {
	createUpKeep,
	getUpKeepByAddress,
	UpKeepSchema,
} from "./automation.model";

export const httpCreateUpKeep = async (
	req: Request,
	res: Response
): Promise<any> => {
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

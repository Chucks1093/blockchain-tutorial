/* eslint-disable @typescript-eslint/no-explicit-any */

import { clsx, type ClassValue } from "clsx";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { SecretMessage } from "@/types/contracts/SecretMessage";
import { MultiSignatureWallet } from "@/types/contracts";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
	if (!address) return "";
	return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export const formatTimestamp = (timestamp: bigint) => {
	return new Date(Number(timestamp) * 1000).toLocaleString();
};

export const showToast = {
	message: (message: string) => {
		toast.remove();
		toast(message);
	},
	success: (message: string) => {
		toast.remove();
		toast.success(message);
	},
	error: (message: string) => {
		toast.remove();
		toast.error(message);
	},
	loading: (message: string) => {
		toast.remove();
		toast.loading(message);
	},
};

export const padZero = (num: number): string => {
	return num < 10 ? `0${num}` : `${num}`;
};

export const handleSecretMessageCustomContractError = (
	error: any,
	contract: SecretMessage
): string => {
	if (error.code === "CALL_EXCEPTION") {
		try {
			const decodedError = contract.interface.parseError(error.data);
			switch (decodedError?.name) {
				case "SecretMessage__UnauthorizedAccess":
					return "Unauthorized: Only the owner can set the general message";
				case "SecretMessage__EmptyMessage":
					return "Message cannot be empty";
				case "SecretMessage__InvalidRecipient":
					return "Please provide a valid recipient address";
				default:
					console.error("Unhandled contract error:", decodedError);
					return "An unexpected contract error occurred";
			}
		} catch (decodeError) {
			console.error("Error decoding:", decodeError);
			return "Failed to decode contract error";
		}
	}
	console.error("Non-contract error:", error);
	return "An unexpected error occurred";
};

export const handleMultiSigCustomContractError = (
	error: any,
	contract: MultiSignatureWallet
): string => {
	if (error.code === "CALL_EXCEPTION") {
		try {
			const decodedError = contract.interface.parseError(error.data);
			switch (decodedError?.name) {
				case "MultiSignatureWallet__OwnerExists":
					return "Owner already exists";
				case "MultiSignatureWallet__UnAuthorisedAccess":
					return "Unauthorized access";
				case "MultiSignatureWallet__OwnerDoesNotExist":
					return `Owner does not exist: ${decodedError.args[0]}`;
				case "MultiSignatureWallet__ExceededMaximumConfirmations":
					return `Exceeded maximum confirmations: ${decodedError.args[0]}`;
				case "MultiSignatureWallet__InvalidInput":
					return "Invalid input provided";
				case "MultiSignatureWallet__AlreadyConfirmed":
					return "Transaction already confirmed";
				default:
					console.error("Unhandled contract error:", decodedError);
					return "An unexpected contract error occurred";
			}
		} catch (decodeError) {
			console.error("Error decoding:", decodeError);
			return "Failed to decode contract error";
		}
	}
	console.error("Non-contract error:", error);
	return "An unexpected error occurred";
};

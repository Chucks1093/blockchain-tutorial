import { clsx, type ClassValue } from "clsx";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
	if (!address) return "";
	return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
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

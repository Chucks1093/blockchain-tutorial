import { CheckCircle2, AlertCircle, Info, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type AlertVariant = "success" | "error" | "info";

interface AlertProps {
	message: string;
	variant?: AlertVariant;
	isLoading?: boolean;
}

const variants: Record<
	AlertVariant | "loading",
	{
		icon: LucideIcon;
		containerClass: string;
		textClass: string;
		iconClass: string;
	}
> = {
	success: {
		icon: CheckCircle2,
		containerClass: "bg-white border-green-100 shadow-green-500/10",
		textClass: "text-green-800",
		iconClass: "text-green-500",
	},
	error: {
		icon: AlertCircle,
		containerClass: "bg-white border-red-100 shadow-red-500/10",
		textClass: "text-red-800",
		iconClass: "text-red-500",
	},
	info: {
		icon: Info,
		containerClass: "bg-white border-blue-100 shadow-blue-500/10",
		textClass: "text-blue-800",
		iconClass: "text-blue-500",
	},
	loading: {
		icon: RefreshCw,
		containerClass: "bg-white border-blue-100 shadow-blue-500/10",
		textClass: "text-blue-800",
		iconClass: "text-blue-500",
	},
};

export function Alert({
	message,
	variant = "success",
	isLoading = false,
}: AlertProps) {
	if (!message && !isLoading) return null;

	const activeVariant = isLoading ? "loading" : variant;
	const {
		icon: Icon,
		containerClass,
		textClass,
		iconClass,
	} = variants[activeVariant];

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className={`p-5 rounded-2xl border shadow-lg ${containerClass}`}>
			<motion.div
				className='flex items-center justify-center space-x-3'
				initial={{ scale: 0.95 }}
				animate={{ scale: 1 }}>
				<Icon
					className={`h-6 w-6 ${iconClass} ${
						isLoading ? "animate-spin" : ""
					}`}
					strokeWidth={2.5}
				/>
				<p className={`text-center text-lg font-medium ${textClass}`}>
					{isLoading ? "Loading message..." : message}
				</p>
			</motion.div>
		</motion.div>
	);
}

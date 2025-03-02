import React from "react";
import { Link } from "react-router";
import {
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	ArrowRight,
} from "lucide-react";
import CopyButton from "../common/CopyButton";
import makeBlockie from "ethereum-blockies-base64";
import { formatDistanceToNow } from "date-fns";

// Enum types from schema
type ActivityType =
	| "CHECK_EXECUTE"
	| "FUND"
	| "REGISTER"
	| "CANCEL"
	| "WITHDRAW";
type ExecStatus = "PENDING" | "SUCCESS" | "REVERTED" | "ERROR" | "SKIPPED";

interface HistoryCardProps {
	transaction: {
		id: string;
		date: Date;
		upkeepId: string;
		upkeepName: string;
		contractAddress: string;
		txHash: string;
		fullHash: string;
		amount: string;
		activityType: ActivityType;
		status: ExecStatus;
		blockNumber?: number;
		gasUsed?: string;
	};
}

const HistoryCard: React.FC<HistoryCardProps> = ({ transaction }) => {
	// Status badge component
	const StatusBadge = ({ status }: { status: ExecStatus }) => {
		const getStatusConfig = (status: ExecStatus) => {
			switch (status) {
				case "SUCCESS":
					return {
						icon: CheckCircle,
						bgColor: "bg-green-100",
						textColor: "text-green-600",
					};
				case "PENDING":
					return {
						icon: Clock,
						bgColor: "bg-yellow-100",
						textColor: "text-yellow-600",
					};
				case "REVERTED":
					return {
						icon: XCircle,
						bgColor: "bg-red-100",
						textColor: "text-red-600",
					};
				case "ERROR":
					return {
						icon: AlertTriangle,
						bgColor: "bg-red-100",
						textColor: "text-red-600",
					};
				case "SKIPPED":
					return {
						icon: Clock,
						bgColor: "bg-gray-100",
						textColor: "text-gray-600",
					};
				default:
					return {
						icon: Clock,
						bgColor: "bg-gray-100",
						textColor: "text-gray-600",
					};
			}
		};

		const { icon: StatusIcon, bgColor, textColor } = getStatusConfig(status);

		return (
			<div
				className={`inline-flex items-center px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
				<StatusIcon className='h-3.5 w-3.5 mr-1' />
				<span className='text-xs font-medium'>{status}</span>
			</div>
		);
	};

	// Format relative time
	const relativeTime = formatDistanceToNow(transaction.date, {
		addSuffix: true,
	});

	// Get activity description
	const getActivityDescription = (type: ActivityType) => {
		switch (type) {
			case "CHECK_EXECUTE":
				return "Executed upkeep function";
			case "FUND":
				return "Added LINK tokens";
			case "REGISTER":
				return "Registered new upkeep";
			case "CANCEL":
				return "Cancelled upkeep";
			case "WITHDRAW":
				return "Withdrew remaining funds";
			default:
				return "Unknown activity";
		}
	};

	return (
		<div className='bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-shadow p-4'>
			<div className='flex items-start'>
				{/* Contract avatar */}
				<img
					src={makeBlockie(transaction.contractAddress)}
					alt='Contract'
					className='h-10 w-10 rounded-md mt-1'
				/>

				{/* Transaction details */}
				<div className='ml-3 flex-1'>
					<div className='flex justify-between items-start'>
						<div>
							<h3 className='text-base font-medium text-gray-900'>
								{transaction.upkeepName}
							</h3>
							<p className='text-sm text-gray-500 mt-0.5'>
								{getActivityDescription(transaction.activityType)}
							</p>
						</div>
						<StatusBadge status={transaction.status} />
					</div>

					<div className='mt-2 flex justify-between items-center'>
						<div className='text-xs text-gray-500'>
							{transaction.blockNumber && (
								<span>Block #{transaction.blockNumber} • </span>
							)}
							<span>{relativeTime}</span>
						</div>
						<span
							className={`text-sm font-medium ${
								transaction.amount.startsWith("-")
									? "text-red-600"
									: "text-green-600"
							}`}>
							{transaction.amount} LINK
						</span>
					</div>

					<div className='mt-2 pt-2 border-t border-gray-100 flex items-center justify-between'>
						<div className='flex items-center'>
							<span className='text-xs font-mono text-blue-500 truncate max-w-[120px] sm:max-w-[200px]'>
								{transaction.txHash}
							</span>
							<CopyButton textToCopy={transaction.fullHash} />
						</div>
						<Link
							to={`/automator/history/${transaction.id}`}
							className='text-xs text-blue-600 flex items-center hover:underline'>
							View Details
							<ArrowRight className='ml-1 h-3 w-3' />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * Grid of history cards for compact display
 */
const HistoryCardGrid: React.FC = () => {
	// Sample data - in a real app you would fetch this from an API
	const transactions = [
		{
			id: "hist-1",
			date: new Date("2025-02-27T16:32:00Z"),
			upkeepId: "589221...2051247",
			upkeepName: "Oracle Price Update",
			contractAddress: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
			txHash: "0x8494...c8b2",
			fullHash: "0x84945a3d2b35e4f8cf8b29dcee3c8b2",
			amount: "-0.087",
			activityType: "CHECK_EXECUTE" as ActivityType,
			status: "SUCCESS" as ExecStatus,
			blockNumber: 17384526,
			gasUsed: "350,450",
		},
		{
			id: "hist-2",
			date: new Date("2025-02-27T16:31:00Z"),
			upkeepId: "531479...89163016",
			upkeepName: "Liquidity Rebalance",
			contractAddress: "0x087a9dfe5c97519b79d7731892e6915c32522a6d",
			txHash: "0x7b7e...e061",
			fullHash: "0x7b7ebc87d9c1c85343c52e061",
			amount: "-0.164",
			activityType: "CHECK_EXECUTE" as ActivityType,
			status: "SUCCESS" as ExecStatus,
			blockNumber: 17384525,
			gasUsed: "420,890",
		},
		{
			id: "hist-3",
			date: new Date("2025-02-27T16:30:00Z"),
			upkeepId: "396790...75057773",
			upkeepName: "Yield Distribution",
			contractAddress: "0xbccbeda63c500a15504fcd0ed12c8c02254a4f78",
			txHash: "0x5656...df95",
			fullHash: "0x565672f1a8e3b7c90e3cdf95",
			amount: "-0.173",
			activityType: "CHECK_EXECUTE" as ActivityType,
			status: "REVERTED" as ExecStatus,
			blockNumber: 17384524,
			gasUsed: "532,104",
		},
		{
			id: "hist-4",
			date: new Date("2025-02-27T16:28:00Z"),
			upkeepId: "638255...58862247",
			upkeepName: "Collateral Check",
			contractAddress: "0x6e6f1d2566b622beef37ae9a3ac3e5addfed610d",
			txHash: "0x8fe2...fc81",
			fullHash: "0x8fe23b6a7d5940c3f8fc81",
			amount: "-0.099",
			activityType: "CHECK_EXECUTE" as ActivityType,
			status: "PENDING" as ExecStatus,
			gasUsed: "285,670",
		},
		{
			id: "hist-5",
			date: new Date("2025-02-27T16:25:00Z"),
			upkeepId: "589221...2051247",
			upkeepName: "Initial Funding",
			contractAddress: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
			txHash: "0x0b50...0631",
			fullHash: "0x0b50a9e2e8c4de1f70631",
			amount: "2.0",
			activityType: "FUND" as ActivityType,
			status: "SUCCESS" as ExecStatus,
			blockNumber: 17384520,
			gasUsed: "120,350",
		},
	];

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{transactions.map((transaction) => (
				<HistoryCard
					key={transaction.id}
					transaction={transaction}
				/>
			))}
		</div>
	);
};

export { HistoryCard, HistoryCardGrid };
export default HistoryCardGrid;

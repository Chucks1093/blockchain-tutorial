import { useParams, Link } from "react-router";

import {
	ChevronLeft,
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	ExternalLink,
	Link as LinkIcon,
	FileText,
	Code,
	Terminal,
	DollarSign,
	Share2,
	ChevronDown,
	Eye,
	Hash,
	LucideIcon,
} from "lucide-react";
import makeBlockie from "ethereum-blockies-base64";
import { formatDistance, format } from "date-fns";
import CopyButton from "../common/CopyButton";

// Enum types from schema
type ActivityType =
	| "CHECK_EXECUTE"
	| "FUND"
	| "REGISTER"
	| "CANCEL"
	| "WITHDRAW";
type ExecStatus = "PENDING" | "SUCCESS" | "REVERTED" | "ERROR" | "SKIPPED";

interface TransactionDetail {
	id: string;
	timestamp: string;
	upkeepId: string;
	upkeepName: string;
	contractAddress: string;
	automatorAddress: string;
	txHash: string;
	blockNumber: number;
	gasUsed: string;
	gasPrice: string;
	gasLimit: string;
	amount: string;
	activityType: ActivityType;
	status: ExecStatus;
	errorMessage?: string;
	logs?: string[];
	upkeepPerformed: boolean;
	functionData?: {
		name: string;
		inputs: {
			name: string;
			type: string;
			value: string;
		}[];
	};
}

const HistoryDetail = () => {
	const { historyId } = useParams<{ historyId: string }>();
	console.log(historyId);

	// Mock data for a transaction detail - in a real app you would fetch this based on historyId
	const transactionDetail: TransactionDetail = {
		id: "hist-1",
		timestamp: "2025-02-27T16:32:00Z",
		upkeepId: "589221...2051247",
		upkeepName: "Oracle Price Update",
		contractAddress: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
		automatorAddress: "0x9876fe5c97519b79d7731892e6915c32522a987",
		txHash:
			"0x84945a3d2b35e4f8cf8b29dcee3c8b2f3a456d7e890a1c2d3e4f5a6b7c8d9e0f",
		blockNumber: 17384526,
		gasUsed: "350,450",
		gasPrice: "35.2 gwei",
		gasLimit: "500,000",
		amount: "-0.0874392015024737",
		activityType: "CHECK_EXECUTE",
		status: "SUCCESS",
		upkeepPerformed: true,
		logs: [
			"Starting execution of upkeep 589221...2051247",
			"Gas price: 35.2 gwei",
			"Estimated gas usage: 350,450",
			"Executing performUpkeep() on 0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
			"Transaction confirmed in block 17384526",
			"Execution completed successfully",
		],
		functionData: {
			name: "performUpkeep",
			inputs: [
				{
					name: "performData",
					type: "bytes",
					value: "0x0000000000000000000000000000000000000000000000000000000000000020",
				},
			],
		},
	};

	// Format timestamp
	const formattedDate = new Date(transactionDetail.timestamp);
	const relativeTime = formatDistance(formattedDate, new Date(), {
		addSuffix: true,
	});
	const fullDateTime = format(formattedDate, "PPpp");

	// Status badge component
	const StatusBadge = ({ status }: { status: ExecStatus }) => {
		const getStatusConfig = (status: ExecStatus) => {
			switch (status) {
				case "SUCCESS":
					return {
						icon: CheckCircle,
						bgColor: "bg-green-100",
						textColor: "text-green-600",
						label: "Successful",
					};
				case "PENDING":
					return {
						icon: Clock,
						bgColor: "bg-yellow-100",
						textColor: "text-yellow-600",
						label: "Pending",
					};
				case "REVERTED":
					return {
						icon: XCircle,
						bgColor: "bg-red-100",
						textColor: "text-red-600",
						label: "Reverted",
					};
				case "ERROR":
					return {
						icon: AlertTriangle,
						bgColor: "bg-red-100",
						textColor: "text-red-600",
						label: "Error",
					};
				case "SKIPPED":
					return {
						icon: Clock,
						bgColor: "bg-gray-100",
						textColor: "text-gray-600",
						label: "Skipped",
					};
				default:
					return {
						icon: Clock,
						bgColor: "bg-gray-100",
						textColor: "text-gray-600",
						label: "Unknown",
					};
			}
		};

		const {
			icon: StatusIcon,
			bgColor,
			textColor,
			label,
		} = getStatusConfig(status);

		return (
			<div
				className={`inline-flex items-center px-3 py-1.5 rounded-full ${bgColor} ${textColor}`}>
				<StatusIcon className='h-4 w-4 mr-1.5' />
				<span className='text-sm font-medium'>{label}</span>
			</div>
		);
	};

	// Activity type badge component
	const ActivityBadge = ({ type }: { type: ActivityType }) => {
		const getActivityConfig = (type: ActivityType) => {
			switch (type) {
				case "CHECK_EXECUTE":
					return {
						bgColor: "bg-blue-100",
						textColor: "text-blue-600",
						label: "Execution",
					};
				case "FUND":
					return {
						bgColor: "bg-green-100",
						textColor: "text-green-600",
						label: "Funding",
					};
				case "REGISTER":
					return {
						bgColor: "bg-purple-100",
						textColor: "text-purple-600",
						label: "Registration",
					};
				case "CANCEL":
					return {
						bgColor: "bg-red-100",
						textColor: "text-red-600",
						label: "Cancellation",
					};
				case "WITHDRAW":
					return {
						bgColor: "bg-orange-100",
						textColor: "text-orange-600",
						label: "Withdrawal",
					};
				default:
					return {
						bgColor: "bg-gray-100",
						textColor: "text-gray-600",
						label: "Unknown",
					};
			}
		};

		const { bgColor, textColor, label } = getActivityConfig(type);

		return (
			<div
				className={`inline-flex items-center px-3 py-1.5 rounded-md ${bgColor} ${textColor}`}>
				<span className='text-sm font-medium'>{label}</span>
			</div>
		);
	};

	// Information card component
	const InfoCard = ({
		title,
		children,
		icon: Icon,
	}: {
		title: string;
		children: React.ReactNode;
		icon: LucideIcon;
	}) => (
		<div className='bg-white border border-gray-200 shadow-sm rounded-lg p-5'>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='text-lg font-medium text-gray-800'>{title}</h3>
				<div className='p-2 rounded-full bg-blue-50'>
					<Icon className='h-5 w-5 text-blue-500' />
				</div>
			</div>
			{children}
		</div>
	);

	// Link to explorer button
	const ExplorerLink = ({ txHash }: { txHash: string }) => (
		<a
			href={`https://etherscan.io/tx/${txHash}`}
			target='_blank'
			rel='noopener noreferrer'
			className='inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors'>
			View on Explorer
			<ExternalLink className='h-3.5 w-3.5 ml-1' />
		</a>
	);

	// Gas usage bar
	const GasUsageBar = ({ used, limit }: { used: string; limit: string }) => {
		const usedValue = parseInt(used.replace(/,/g, ""));
		const limitValue = parseInt(limit.replace(/,/g, ""));
		const percentage = Math.min(
			100,
			Math.round((usedValue / limitValue) * 100)
		);

		return (
			<div className='mt-2'>
				<div className='flex justify-between mb-1 text-xs'>
					<span>Gas Used: {used}</span>
					<span>{percentage}%</span>
				</div>
				<div className='w-full bg-gray-200 rounded-full h-2'>
					<div
						className={`h-2 rounded-full ${
							percentage > 90
								? "bg-red-500"
								: percentage > 75
								? "bg-yellow-500"
								: "bg-green-500"
						}`}
						style={{ width: `${percentage}%` }}></div>
				</div>
				<div className='text-right text-xs text-gray-500 mt-1'>
					Gas Limit: {limit}
				</div>
			</div>
		);
	};

	// Console output component
	const ConsoleOutput = ({ logs }: { logs?: string[] }) => {
		if (!logs || logs.length === 0) return null;

		return (
			<div className='bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto'>
				{logs.map((log, index) => (
					<div
						key={index}
						className='py-0.5'>
						<span className='text-gray-500 mr-2'>{index + 1}. </span>
						<span>{log}</span>
					</div>
				))}
			</div>
		);
	};

	// Function call details
	const FunctionCallDetails = ({
		functionData,
	}: {
		functionData?: TransactionDetail["functionData"];
	}) => {
		if (!functionData) return null;

		return (
			<div className='bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-gray-200'>
				<div className='text-blue-600'>
					{functionData.name}
					<span className='text-gray-500'>(</span>
				</div>
				{functionData.inputs.map((input, index) => (
					<div
						key={index}
						className='pl-4 text-gray-700'>
						<span className='text-purple-600'>{input.name}</span>:
						<span className='text-gray-500'> {input.type} = </span>
						<span className='text-green-600'>{input.value}</span>
						{index < functionData.inputs.length - 1 && (
							<span className='text-gray-500'>,</span>
						)}
					</div>
				))}
				<div className='text-gray-500'>)</div>
			</div>
		);
	};

	return (
		<div className='max-w-7xl mx-auto px-4 md:px-8 py-6'>
			{/* Breadcrumb and header */}
			<div className='mb-6'>
				<Link
					to='/automator/history'
					className='inline-flex items-center text-blue-600 mb-4 hover:underline'>
					<ChevronLeft className='h-4 w-4 mr-1' />
					Back to History
				</Link>

				<div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
					<div>
						<h1 className='text-3xl font-medium text-gray-900'>
							Transaction Details
						</h1>
						<p className='text-gray-500'>
							{fullDateTime}{" "}
							<span className='text-gray-400'>({relativeTime})</span>
						</p>
					</div>

					<div className='flex items-center gap-2'>
						<StatusBadge status={transactionDetail.status} />
						<ActivityBadge type={transactionDetail.activityType} />
						<ExplorerLink txHash={transactionDetail.txHash} />
					</div>
				</div>
			</div>

			{/* Main content grid */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left column - Transaction details */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Transaction summary card */}
					<InfoCard
						title='Transaction Summary'
						icon={FileText}>
						<div className='flex flex-col sm:flex-row gap-4 sm:gap-8'>
							<div className='flex-1 space-y-4'>
								<div>
									<h4 className='text-sm font-medium text-gray-500 mb-1'>
										Upkeep Name
									</h4>
									<p className='text-gray-800 font-medium'>
										{transactionDetail.upkeepName}
									</p>
								</div>

								<div>
									<h4 className='text-sm font-medium text-gray-500 mb-1'>
										Transaction Hash
									</h4>
									<div className='flex items-center'>
										<span className='text-blue-600 font-mono text-sm truncate max-w-xs'>
											{transactionDetail.txHash}
										</span>
										<CopyButton
											textToCopy={transactionDetail.txHash}
										/>
									</div>
								</div>

								<div>
									<h4 className='text-sm font-medium text-gray-500 mb-1'>
										Contract Called
									</h4>
									<div className='flex items-center'>
										<img
											src={makeBlockie(
												transactionDetail.contractAddress
											)}
											alt='Contract'
											className='h-6 w-6 rounded-full mr-2'
										/>
										<span className='text-blue-600 font-mono text-sm'>
											{transactionDetail.contractAddress}
										</span>
										<CopyButton
											textToCopy={transactionDetail.contractAddress}
										/>
									</div>
								</div>
							</div>

							<div className='flex-1 space-y-4'>
								<div>
									<h4 className='text-sm font-medium text-gray-500 mb-1'>
										Block Information
									</h4>
									<p className='text-gray-800'>
										<span className='font-medium'>
											#{transactionDetail.blockNumber}
										</span>
										<span className='text-gray-500 text-sm ml-1'>
											({fullDateTime})
										</span>
									</p>
								</div>

								<div>
									<h4 className='text-sm font-medium text-gray-500 mb-1'>
										LINK Amount
									</h4>
									<p
										className={`font-medium ${
											transactionDetail.amount.startsWith("-")
												? "text-red-600"
												: "text-green-600"
										}`}>
										{transactionDetail.amount} LINK
									</p>
								</div>

								<div>
									<h4 className='text-sm font-medium text-gray-500 mb-1'>
										Executed By
									</h4>
									<div className='flex items-center'>
										<img
											src={makeBlockie(
												transactionDetail.automatorAddress
											)}
											alt='Automator'
											className='h-6 w-6 rounded-full mr-2'
										/>
										<span className='text-blue-600 font-mono text-sm'>
											{transactionDetail.automatorAddress}
										</span>
										<CopyButton
											textToCopy={transactionDetail.automatorAddress}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Gas usage section */}
						<div className='mt-6 pt-4 border-t border-gray-200'>
							<h4 className='text-sm font-medium text-gray-500 mb-2'>
								Gas Usage
							</h4>
							<div className='flex gap-2 items-center text-gray-800 mb-2'>
								<span className='text-gray-700'>
									<span className='font-medium'>
										{transactionDetail.gasUsed}
									</span>{" "}
									gas used at{" "}
									<span className='font-medium'>
										{transactionDetail.gasPrice}
									</span>
								</span>
							</div>
							<GasUsageBar
								used={transactionDetail.gasUsed}
								limit={transactionDetail.gasLimit}
							/>
						</div>
					</InfoCard>

					{/* Function details card */}
					<InfoCard
						title='Function Call Details'
						icon={Code}>
						<div className='space-y-3'>
							<div>
								<h4 className='text-sm font-medium text-gray-500 mb-1'>
									Function Called
								</h4>
								<p className='text-gray-800 font-mono'>
									{transactionDetail.functionData?.name}()
								</p>
							</div>

							{transactionDetail.functionData && (
								<div>
									<h4 className='text-sm font-medium text-gray-500 mb-1'>
										Input Parameters
									</h4>
									<FunctionCallDetails
										functionData={transactionDetail.functionData}
									/>
								</div>
							)}

							<div>
								<h4 className='text-sm font-medium text-gray-500 mb-2'>
									Execution Log
								</h4>
								<ConsoleOutput logs={transactionDetail.logs} />
							</div>
						</div>
					</InfoCard>
				</div>

				{/* Right column - Related information */}
				<div className='space-y-6'>
					{/* Upkeep information card */}
					<InfoCard
						title='Upkeep Information'
						icon={LinkIcon}>
						<div className='flex items-center mb-4'>
							<img
								src={makeBlockie(transactionDetail.contractAddress)}
								alt='Contract'
								className='h-10 w-10 rounded-lg mr-3'
							/>
							<div>
								<p className='text-gray-800 font-medium'>
									{transactionDetail.upkeepName}
								</p>
								<p className='text-gray-500 text-sm'>
									{transactionDetail.upkeepId}
								</p>
							</div>
						</div>

						<div className='space-y-3 text-sm'>
							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Status</span>
								<span className='text-green-600 font-medium flex items-center'>
									<CheckCircle className='h-4 w-4 mr-1' />
									Active
								</span>
							</div>

							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Function</span>
								<span className='text-gray-800 font-mono'>
									performUpkeep()
								</span>
							</div>

							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Interval</span>
								<span className='text-gray-800'>24h</span>
							</div>

							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Last Run</span>
								<span className='text-gray-800'>{relativeTime}</span>
							</div>

							<div className='flex justify-between py-2'>
								<span className='text-gray-500'>Total Executions</span>
								<span className='text-gray-800 font-medium'>127</span>
							</div>
						</div>

						<div className='mt-4 pt-4 border-t border-gray-200'>
							<Link
								to={`/automator/${transactionDetail.upkeepId}`}
								className='inline-flex items-center text-blue-600 hover:underline'>
								View upkeep details
								<ExternalLink className='h-3.5 w-3.5 ml-1' />
							</Link>
						</div>
					</InfoCard>

					{/* Technical details card */}
					<InfoCard
						title='Technical Details'
						icon={Terminal}>
						<div className='space-y-3 text-sm'>
							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Network</span>
								<span className='text-gray-800'>
									Ethereum (Mainnet)
								</span>
							</div>

							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Gas Price</span>
								<span className='text-gray-800'>
									{transactionDetail.gasPrice}
								</span>
							</div>

							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Gas Limit</span>
								<span className='text-gray-800'>
									{transactionDetail.gasLimit}
								</span>
							</div>

							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Gas Used</span>
								<span className='text-gray-800'>
									{transactionDetail.gasUsed}
								</span>
							</div>

							<div className='flex justify-between py-2 border-b border-gray-100'>
								<span className='text-gray-500'>Transaction Index</span>
								<span className='text-gray-800'>23</span>
							</div>

							<div className='flex justify-between py-2'>
								<span className='text-gray-500'>Input Data Size</span>
								<span className='text-gray-800'>134 bytes</span>
							</div>
						</div>

						<div className='mt-4 pt-4 border-t border-gray-200'>
							<details className='group'>
								<summary className='flex cursor-pointer items-center text-sm text-blue-600'>
									<span className='hover:underline'>
										View raw transaction data
									</span>
									<ChevronDown className='ml-1 h-4 w-4 transition-transform group-open:rotate-180' />
								</summary>
								<div className='mt-2 rounded-md bg-gray-900 p-3 text-xs font-mono text-gray-300 overflow-auto max-h-40'>
									{`{
  "from": "0x9876fe5c97519b79d7731892e6915c32522a987",
  "to": "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
  "data": "0x4585e33b0000000000000000000000000000000000000000000000000000000000000020"}`}
								</div>
							</details>
						</div>
					</InfoCard>

					{/* Related transactions */}
					<div className='bg-white border border-gray-200 shadow-sm rounded-lg p-5'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-medium text-gray-800'>
								Related Transactions
							</h3>
							<div className='p-2 rounded-full bg-blue-50'>
								<Share2 className='h-5 w-5 text-blue-500' />
							</div>
						</div>

						<div className='space-y-3'>
							<div className='p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors'>
								<div className='flex items-center gap-3'>
									<div className='p-2 rounded-full bg-gray-100'>
										<Hash className='h-5 w-5 text-gray-500' />
									</div>
									<div className='flex-1'>
										<p className='text-sm font-medium'>
											Previous Execution
										</p>
										<div className='flex items-center text-xs text-gray-500'>
											<span className='font-mono'>
												0x7b7e...e061
											</span>
											<span className='mx-2'>•</span>
											<span>2 hours ago</span>
										</div>
									</div>
									<Link
										to='/automator/history/prev'
										className='p-1 text-blue-600'>
										<Eye className='h-4 w-4' />
									</Link>
								</div>
							</div>

							<div className='p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors'>
								<div className='flex items-center gap-3'>
									<div className='p-2 rounded-full bg-green-100'>
										<DollarSign className='h-5 w-5 text-green-500' />
									</div>
									<div className='flex-1'>
										<p className='text-sm font-medium'>
											Initial Funding
										</p>
										<div className='flex items-center text-xs text-gray-500'>
											<span className='font-mono'>
												0x0b50...0631
											</span>
											<span className='mx-2'>•</span>
											<span>1 day ago</span>
										</div>
									</div>
									<Link
										to='/automator/history/fund'
										className='p-1 text-blue-600'>
										<Eye className='h-4 w-4' />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HistoryDetail;

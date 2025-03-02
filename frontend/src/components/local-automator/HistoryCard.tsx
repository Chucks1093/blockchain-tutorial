import { useState } from "react";
import { motion } from "framer-motion";
import {
	ChevronDown,
	Calendar,
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	Filter,
	Search,
	ArrowRight,
} from "lucide-react";
import CopyButton from "../common/CopyButton";
import makeBlockie from "ethereum-blockies-base64";

// Enum types from schema
type ActivityType =
	| "CHECK_EXECUTE"
	| "FUND"
	| "REGISTER"
	| "CANCEL"
	| "WITHDRAW";
type ExecStatus = "PENDING" | "SUCCESS" | "REVERTED" | "ERROR" | "SKIPPED";

interface HistoryTransaction {
	id: string;
	date: string;
	time: string;
	upkeepId: string;
	upkeepName: string;
	contractAddress: string;
	txHash: string;
	fullHash: string;
	amount: string;
	gas: string;
	activityType: ActivityType;
	status: ExecStatus;
	blockNumber?: number;
	gasPrice?: string;
	errorMessage?: string;
	upkeepPerformed: boolean;
}

const HistoryTable = () => {
	// Sample transaction data with extended fields based on the schema
	const transactions: HistoryTransaction[] = [
		{
			id: "hist-1",
			date: "February 27, 2025",
			time: "16:32",
			upkeepId: "589221...2051247",
			upkeepName: "Oracle Price Update",
			contractAddress: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
			txHash: "0x8494...c8b2",
			fullHash: "0x84945a3d2b35e4f8cf8b29dcee3c8b2",
			amount: "-0.0874392015024737",
			gas: "350,450",
			activityType: "CHECK_EXECUTE",
			status: "SUCCESS",
			blockNumber: 17384526,
			gasPrice: "35.2 gwei",
			upkeepPerformed: true,
		},
		{
			id: "hist-2",
			date: "February 27, 2025",
			time: "16:31",
			upkeepId: "531479...89163016",
			upkeepName: "Liquidity Rebalance",
			contractAddress: "0x087a9dfe5c97519b79d7731892e6915c32522a6d",
			txHash: "0x7b7e...e061",
			fullHash: "0x7b7ebc87d9c1c85343c52e061",
			amount: "-0.1645946019954828",
			gas: "420,890",
			activityType: "CHECK_EXECUTE",
			status: "SUCCESS",
			blockNumber: 17384525,
			gasPrice: "34.8 gwei",
			upkeepPerformed: true,
		},
		{
			id: "hist-3",
			date: "February 27, 2025",
			time: "16:30",
			upkeepId: "396790...75057773",
			upkeepName: "Yield Distribution",
			contractAddress: "0xbccbeda63c500a15504fcd0ed12c8c02254a4f78",
			txHash: "0x5656...df95",
			fullHash: "0x565672f1a8e3b7c90e3cdf95",
			amount: "-0.1731505741261977",
			gas: "532,104",
			activityType: "CHECK_EXECUTE",
			status: "REVERTED",
			blockNumber: 17384524,
			gasPrice: "36.1 gwei",
			errorMessage: "Out of gas",
			upkeepPerformed: false,
		},
		{
			id: "hist-4",
			date: "February 27, 2025",
			time: "16:28",
			upkeepId: "638255...58862247",
			upkeepName: "Collateral Check",
			contractAddress: "0x6e6f1d2566b622beef37ae9a3ac3e5addfed610d",
			txHash: "0x8fe2...fc81",
			fullHash: "0x8fe23b6a7d5940c3f8fc81",
			amount: "-0.0998656849602606",
			gas: "285,670",
			activityType: "CHECK_EXECUTE",
			status: "PENDING",
			gasPrice: "35.0 gwei",
			upkeepPerformed: false,
		},
		{
			id: "hist-5",
			date: "February 27, 2025",
			time: "16:25",
			upkeepId: "589221...2051247",
			upkeepName: "Initial Funding",
			contractAddress: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
			txHash: "0x0b50...0631",
			fullHash: "0x0b50a9e2e8c4de1f70631",
			amount: "2",
			gas: "120,350",
			activityType: "FUND",
			status: "SUCCESS",
			blockNumber: 17384520,
			gasPrice: "34.5 gwei",
			upkeepPerformed: false,
		},
	];

	// State for filters
	const [filters, setFilters] = useState({
		status: "all",
		activityType: "all",
		upkeepId: "",
		searchTerm: "",
	});

	// State for sort order
	const [sortOrder, setSortOrder] = useState("newest");

	// Filter transactions based on filter settings
	const getFilteredTransactions = () => {
		return transactions
			.filter((tx) => {
				if (
					filters.status !== "all" &&
					tx.status.toLowerCase() !== filters.status.toLowerCase()
				) {
					return false;
				}
				if (
					filters.activityType !== "all" &&
					tx.activityType !== filters.activityType
				) {
					return false;
				}
				if (filters.upkeepId && !tx.upkeepId.includes(filters.upkeepId)) {
					return false;
				}
				if (filters.searchTerm) {
					const searchLower = filters.searchTerm.toLowerCase();
					return (
						tx.upkeepName.toLowerCase().includes(searchLower) ||
						tx.txHash.toLowerCase().includes(searchLower) ||
						tx.contractAddress.toLowerCase().includes(searchLower)
					);
				}
				return true;
			})
			.sort((a, b) => {
				// Combine date and time for sorting
				const dateA = new Date(`${a.date} ${a.time}`).getTime();
				const dateB = new Date(`${b.date} ${b.time}`).getTime();
				return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
			});
	};

	// Get filtered transactions
	const filteredTransactions = getFilteredTransactions();

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

	// Activity type badge component
	const ActivityBadge = ({ type }: { type: ActivityType }) => {
		const getActivityConfig = (type: ActivityType) => {
			switch (type) {
				case "CHECK_EXECUTE":
					return { bgColor: "bg-blue-100", textColor: "text-blue-600" };
				case "FUND":
					return { bgColor: "bg-green-100", textColor: "text-green-600" };
				case "REGISTER":
					return {
						bgColor: "bg-purple-100",
						textColor: "text-purple-600",
					};
				case "CANCEL":
					return { bgColor: "bg-red-100", textColor: "text-red-600" };
				case "WITHDRAW":
					return {
						bgColor: "bg-orange-100",
						textColor: "text-orange-600",
					};
				default:
					return { bgColor: "bg-gray-100", textColor: "text-gray-600" };
			}
		};

		const { bgColor, textColor } = getActivityConfig(type);

		return (
			<div
				className={`inline-flex items-center px-2 py-1 rounded-md ${bgColor} ${textColor}`}>
				<span className='text-xs font-medium'>
					{type.replace("_", " ")}
				</span>
			</div>
		);
	};

	// Filter component
	const TransactionFilters = () => (
		<div className='mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm'>
			<div className='flex flex-wrap gap-4 items-center'>
				<div className='relative flex-1 min-w-[250px]'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
					<input
						type='text'
						placeholder='Search by name, tx hash, or address...'
						value={filters.searchTerm}
						onChange={(e) =>
							setFilters({ ...filters, searchTerm: e.target.value })
						}
						className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
					/>
				</div>

				<div className='flex items-center gap-2'>
					<label className='text-sm text-gray-600'>Status:</label>
					<select
						value={filters.status}
						onChange={(e) =>
							setFilters({ ...filters, status: e.target.value })
						}
						className='px-3 py-2 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'>
						<option value='all'>All Status</option>
						<option value='success'>Success</option>
						<option value='pending'>Pending</option>
						<option value='reverted'>Reverted</option>
						<option value='error'>Error</option>
					</select>
				</div>

				<div className='flex items-center gap-2'>
					<label className='text-sm text-gray-600'>Activity:</label>
					<select
						value={filters.activityType}
						onChange={(e) =>
							setFilters({ ...filters, activityType: e.target.value })
						}
						className='px-3 py-2 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'>
						<option value='all'>All Activities</option>
						<option value='CHECK_EXECUTE'>Check Execute</option>
						<option value='FUND'>Fund</option>
						<option value='REGISTER'>Register</option>
						<option value='CANCEL'>Cancel</option>
						<option value='WITHDRAW'>Withdraw</option>
					</select>
				</div>

				<div className='flex items-center gap-2'>
					<label className='text-sm text-gray-600'>Sort:</label>
					<select
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value)}
						className='px-3 py-2 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'>
						<option value='newest'>Newest First</option>
						<option value='oldest'>Oldest First</option>
					</select>
				</div>

				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					className='ml-auto p-2 bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1'>
					<Filter className='h-4 w-4' />
					<span>Reset</span>
				</motion.button>
			</div>
		</div>
	);

	return (
		<div className='space-y-5'>
			<TransactionFilters />

			<div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
				{filteredTransactions.length > 0 ? (
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center cursor-pointer'>
											Date / Time
											<ChevronDown className='ml-1 h-4 w-4 text-gray-400' />
										</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Upkeep</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Activity</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Status</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>
											Transaction
										</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>
											Amount{" "}
											<span className='text-xs ml-1'>LINK</span>
										</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>
											Gas <span className='text-xs ml-1'>wei</span>
										</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{filteredTransactions.map((tx) => (
									<tr
										key={tx.id}
										className='hover:bg-gray-50 transition-colors'>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
											<div className='font-medium'>{tx.date}</div>
											<div className='text-gray-500 text-xs'>
												{tx.time}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												<img
													src={makeBlockie(tx.contractAddress)}
													alt='Contract'
													className='h-8 w-8 rounded-md mr-3'
												/>
												<div>
													<div className='text-sm font-medium text-gray-900'>
														{tx.upkeepName}
													</div>
													<div className='text-xs text-gray-500'>
														{tx.upkeepId}
													</div>
												</div>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<ActivityBadge type={tx.activityType} />
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<StatusBadge status={tx.status} />
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												<span className='text-sm font-mono text-blue-500'>
													{tx.txHash}
												</span>
												<CopyButton textToCopy={tx.fullHash} />
											</div>
											{tx.blockNumber && (
												<div className='text-xs text-gray-500'>
													Block #{tx.blockNumber}
												</div>
											)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<span
												className={`text-sm font-medium ${
													tx.amount.startsWith("-")
														? "text-red-600"
														: "text-green-600"
												}`}>
												{tx.amount}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-700'>
												{tx.gas}
											</div>
											{tx.gasPrice && (
												<div className='text-xs text-gray-500'>
													{tx.gasPrice}
												</div>
											)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
											<a
												href={`/automator/history/${tx.id}`}
												className='text-blue-600 hover:text-blue-900 flex items-center justify-end'>
												View
												<ArrowRight className='ml-1 h-4 w-4' />
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{/* Pagination section */}
						<div className='bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between'>
							<div className='text-sm text-gray-700'>
								Showing <span className='font-medium'>1</span> to{" "}
								<span className='font-medium'>
									{filteredTransactions.length}
								</span>{" "}
								of{" "}
								<span className='font-medium'>
									{transactions.length}
								</span>{" "}
								results
							</div>
							<div className='flex items-center gap-2'>
								<button
									disabled
									className='px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-400 bg-gray-50 cursor-not-allowed'>
									Previous
								</button>
								<button
									disabled
									className='px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-400 bg-gray-50 cursor-not-allowed'>
									Next
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className='py-16 text-center'>
						<Calendar className='h-16 w-16 mx-auto text-gray-300 mb-4' />
						<h3 className='text-xl font-medium text-gray-700 mb-2'>
							No history records found
						</h3>
						<p className='text-gray-500 max-w-md mx-auto mb-6'>
							{filters.searchTerm ||
							filters.status !== "all" ||
							filters.activityType !== "all"
								? "Try adjusting your filters to see more results"
								: "Execution history will appear here once your tasks have been executed"}
						</p>
						{(filters.searchTerm ||
							filters.status !== "all" ||
							filters.activityType !== "all") && (
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className='px-4 py-2 bg-blue-500 text-white rounded-lg shadow'
								onClick={() =>
									setFilters({
										status: "all",
										activityType: "all",
										upkeepId: "",
										searchTerm: "",
									})
								}>
								Clear filters
							</motion.button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default HistoryTable;

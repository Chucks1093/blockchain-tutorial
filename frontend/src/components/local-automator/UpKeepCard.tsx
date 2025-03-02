import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	CheckCircle,
	XCircle,
	Clock,
	Pause,
	Plus,
	Search,
	Filter,
	Download,
	MoreHorizontal,
	ArrowRight,
	AlertTriangle,
} from "lucide-react";
import { Link } from "react-router";
import makeBlockie from "ethereum-blockies-base64";
import CopyButton from "../common/CopyButton";
import { formatDistanceToNow } from "date-fns";

// Status type
type UpkeepStatus = "active" | "pending" | "inactive" | "cancelled";

// Upkeep data structure
interface Upkeep {
	id: string;
	name: string;
	status: UpkeepStatus;
	address: string;
	interval: string;
	intervalSeconds: number;
	function: string;
	nextExecution: Date;
	lastExecution?: Date;
	createdAt: Date;
	linkBalance: string;
	minLinkBalance: string;
	gasLimit: number;
	totalExecutions: number;
	totalSpent: string;
	registry: string;
	performDataSize?: number;
}

const UpkeepTable: React.FC = () => {
	// Sample upkeep data
	const upkeeps: Upkeep[] = [
		{
			id: "589221...2051247",
			name: "Oracle Price Update",
			status: "active",
			address: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
			interval: "24h",
			intervalSeconds: 86400,
			function: "performUpkeep()",
			nextExecution: new Date(Date.now() + 3600000),
			lastExecution: new Date(Date.now() - 82800000),
			createdAt: new Date(Date.now() - 604800000),
			linkBalance: "2.0 LINK",
			minLinkBalance: "0.5 LINK",
			gasLimit: 500000,
			totalExecutions: 28,
			totalSpent: "0.45 LINK",
			registry: "v2.1",
			performDataSize: 68,
		},
		{
			id: "531479...89163016",
			name: "Liquidity Rebalancer",
			status: "active",
			address: "0x087a9dfe5c97519b79d7731892e6915c32522a6d",
			interval: "1h",
			intervalSeconds: 3600,
			function: "checkAndRebalance()",
			nextExecution: new Date(Date.now() + 1200000),
			lastExecution: new Date(Date.now() - 2400000),
			createdAt: new Date(Date.now() - 864000000),
			linkBalance: "10.0 LINK",
			minLinkBalance: "0.5 LINK",
			gasLimit: 450000,
			totalExecutions: 196,
			totalSpent: "3.21 LINK",
			registry: "v2.1",
		},
		{
			id: "396790...75057773",
			name: "Token Vesting",
			status: "inactive",
			address: "0xbccbeda63c500a15504fcd0ed12c8c02254a4f78",
			interval: "7d",
			intervalSeconds: 604800,
			function: "releaseTokens()",
			nextExecution: new Date(Date.now() + 86400000),
			lastExecution: new Date(Date.now() - 518400000),
			createdAt: new Date(Date.now() - 2592000000),
			linkBalance: "0.91 LINK",
			minLinkBalance: "0.5 LINK",
			gasLimit: 650000,
			totalExecutions: 12,
			totalSpent: "1.85 LINK",
			registry: "v2.1",
			performDataSize: 128,
		},
		{
			id: "638255...58862247",
			name: "NFT Royalty Distribution",
			status: "pending",
			address: "0x6e6f1d2566b622beef37ae9a3ac3e5addfed610d",
			interval: "30d",
			intervalSeconds: 2592000,
			function: "distributeRoyalties()",
			nextExecution: new Date(Date.now() + 1296000000),
			createdAt: new Date(Date.now() - 86400000),
			linkBalance: "1.53 LINK",
			minLinkBalance: "0.5 LINK",
			gasLimit: 750000,
			totalExecutions: 0,
			totalSpent: "0.0 LINK",
			registry: "v2.1",
		},
	];

	// Filter state
	const [filters, setFilters] = useState({
		status: "all",
		searchTerm: "",
	});

	// Filter upkeeps
	const getFilteredUpkeeps = () => {
		return upkeeps.filter((upkeep) => {
			if (filters.status !== "all" && upkeep.status !== filters.status) {
				return false;
			}
			if (filters.searchTerm) {
				const searchLower = filters.searchTerm.toLowerCase();
				return (
					upkeep.name.toLowerCase().includes(searchLower) ||
					upkeep.id.toLowerCase().includes(searchLower) ||
					upkeep.address.toLowerCase().includes(searchLower) ||
					upkeep.function.toLowerCase().includes(searchLower)
				);
			}
			return true;
		});
	};

	const filteredUpkeeps = getFilteredUpkeeps();

	// Status badge component
	const StatusBadge: React.FC<{ status: UpkeepStatus }> = ({ status }) => {
		const getStatusConfig = (status: UpkeepStatus) => {
			switch (status) {
				case "active":
					return {
						icon: CheckCircle,
						bgColor: "bg-green-100",
						textColor: "text-green-600",
					};
				case "pending":
					return {
						icon: Clock,
						bgColor: "bg-yellow-100",
						textColor: "text-yellow-600",
					};
				case "inactive":
					return {
						icon: Pause,
						bgColor: "bg-gray-100",
						textColor: "text-gray-600",
					};
				case "cancelled":
					return {
						icon: XCircle,
						bgColor: "bg-red-100",
						textColor: "text-red-600",
					};
				default:
					return {
						icon: AlertTriangle,
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
				<span className='text-xs font-medium capitalize'>{status}</span>
			</div>
		);
	};

	// Link balance indicator
	const LinkBalanceIndicator: React.FC<{
		balance: string;
		minBalance: string;
	}> = ({ balance, minBalance }) => {
		const balanceValue = parseFloat(balance.split(" ")[0]);
		const minBalanceValue = parseFloat(minBalance.split(" ")[0]);

		const percentage = Math.min(
			100,
			Math.round((balanceValue / (minBalanceValue * 2)) * 100)
		);

		return (
			<div className='flex flex-col'>
				<span className='text-sm font-medium mb-1'>{balance}</span>
				<div className='w-full bg-gray-200 rounded-full h-1.5'>
					<div
						className={`h-1.5 rounded-full ${
							percentage < 25
								? "bg-red-500"
								: percentage < 50
								? "bg-yellow-500"
								: "bg-green-500"
						}`}
						style={{ width: `${percentage}%` }}></div>
				</div>
				<span className='text-xs text-gray-500 mt-1'>
					Min: {minBalance}
				</span>
			</div>
		);
	};

	// Next execution indicator
	const NextExecutionIndicator: React.FC<{ date: Date }> = ({ date }) => {
		const timeLeft = formatDistanceToNow(date, { addSuffix: false });
		const isPast = date < new Date();

		return (
			<div className='flex flex-col'>
				<span
					className={`text-sm font-medium ${
						isPast ? "text-red-600" : "text-gray-800"
					}`}>
					{isPast ? "Overdue" : `In ${timeLeft}`}
				</span>
				<span className='text-xs text-gray-500'>
					{date.toLocaleString()}
				</span>
			</div>
		);
	};

	// Filter component
	const UpkeepFilters: React.FC = () => (
		<div className='mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm'>
			<div className='flex flex-wrap gap-4 items-center'>
				<div className='relative flex-1 min-w-[250px]'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
					<input
						type='text'
						placeholder='Search upkeeps...'
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
						<option value='active'>Active</option>
						<option value='pending'>Pending</option>
						<option value='inactive'>Inactive</option>
						<option value='cancelled'>Cancelled</option>
					</select>
				</div>

				<div className='flex gap-2 ml-auto'>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='p-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1'>
						<Filter className='h-4 w-4' />
						<span className='text-sm'>Reset</span>
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='p-2 bg-gray-100 text-gray-600 rounded-lg'>
						<Download className='h-4 w-4' />
					</motion.button>
				</div>
			</div>
		</div>
	);

	// Empty state
	const EmptyState: React.FC = () => (
		<div className='py-16 text-center'>
			<Clock className='h-16 w-16 mx-auto text-gray-300 mb-4' />
			<h3 className='text-xl font-medium text-gray-700 mb-2'>
				No upkeeps found
			</h3>
			<p className='text-gray-500 max-w-md mx-auto mb-6'>
				{filters.searchTerm || filters.status !== "all"
					? "Try adjusting your filters to see more results"
					: "Create your first Chainlink Automation upkeep to get started"}
			</p>
			{filters.searchTerm || filters.status !== "all" ? (
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					className='px-4 py-2 bg-blue-500 text-white rounded-lg shadow'
					onClick={() => setFilters({ status: "all", searchTerm: "" })}>
					Clear filters
				</motion.button>
			) : (
				<Link to='/automator/new'>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md'>
						<Plus className='h-5 w-5 inline-block mr-2' />
						Create Upkeep
					</motion.button>
				</Link>
			)}
		</div>
	);

	return (
		<div className='space-y-5'>
			<UpkeepFilters />

			<div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
				{filteredUpkeeps.length > 0 ? (
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Upkeep</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Status</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Contract</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>
											Next Execution
										</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Function</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>Interval</div>
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										<div className='flex items-center'>
											LINK Balance
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
								{filteredUpkeeps.map((upkeep) => (
									<tr
										key={upkeep.id}
										className='hover:bg-gray-50 transition-colors'>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												<div>
													<div className='text-sm font-medium text-gray-900'>
														{upkeep.name}
													</div>
													<div className='text-xs text-blue-500 font-mono'>
														{upkeep.id}
													</div>
												</div>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<StatusBadge status={upkeep.status} />
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												<img
													src={makeBlockie(upkeep.address)}
													alt='Contract'
													className='h-8 w-8 rounded-md mr-3'
												/>
												<div className='text-sm font-mono text-gray-500 flex items-center'>
													{upkeep.address.substring(0, 6)}...
													{upkeep.address.substring(
														upkeep.address.length - 4
													)}
													<CopyButton
														textToCopy={upkeep.address}
													/>
												</div>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<NextExecutionIndicator
												date={upkeep.nextExecution}
											/>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm font-mono text-gray-700'>
												{upkeep.function}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<span className='px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md'>
												{upkeep.interval}
											</span>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<LinkBalanceIndicator
												balance={upkeep.linkBalance}
												minBalance={upkeep.minLinkBalance}
											/>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
											<div className='flex items-center justify-end gap-2'>
												<Link
													to={`/automator/${upkeep.id}`}
													className='text-blue-600 hover:text-blue-900 flex items-center'>
													View
													<ArrowRight className='ml-1 h-4 w-4' />
												</Link>
												<button className='text-gray-500 hover:text-gray-700'>
													<MoreHorizontal className='h-5 w-5' />
												</button>
											</div>
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
									{filteredUpkeeps.length}
								</span>{" "}
								of <span className='font-medium'>{upkeeps.length}</span>{" "}
								upkeeps
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
					<EmptyState />
				)}
			</div>
		</div>
	);
};

export default UpkeepTable;

import { useState, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiSigWallet } from "@/components/multisign/MultisigWalletService";
import {
	Wallet,
	Send,
	Users,
	Settings,
	AlertTriangle,
	Download,
	Upload,
	Search,
	Trash2,
	RefreshCw,
} from "lucide-react";
import { formatTimestamp, padZero } from "@/lib/utils";
import ProjectHeader from "@/components/common/ProjectHeader";
import TransactionCard from "@/components/multisign/TransactionCard";

const MultisigWallet = () => {
	// Enhanced state management
	const {
		owners,
		requiredSignatures,
		walletBalance,
		addNewOwner,
		submitTransaction,
		transactions,
		addressRef,
		descriptionRef,
		amountRef,
		newOwnerRef,
	} = useMultiSigWallet();

	const [activeTab, setActiveTab] = useState<string>("transactions");

	const [filters, setFilters] = useState<{
		status: string;
		timeRange: string;
		minAmount: string;
		maxAmount: string;
	}>({
		status: "all",
		timeRange: "all",
		minAmount: "",
		maxAmount: "",
	});
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [sortOrder, setSortOrder] = useState<string>("newest");
	const [isLoading] = useState<boolean>(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

	// Additional refs for new features
	const newSignaturesRef = useRef<HTMLInputElement>(null);
	const ownerRoleRef = useRef<HTMLSelectElement>(null);
	const txStatus = (executed: boolean) => (executed ? "Executed" : "Pending");

	// Transaction history export
	const exportTransactionHistory = () => {
		const csv = transactions.map((tx) => ({
			ID: tx.txHash,
			To: tx.to,
			Amount: tx.amount,
			Status: txStatus,
			Approvals: `${tx.confirmations}`,
			Timestamp: formatTimestamp(tx.timestamp),
		}));

		// Convert to CSV and download
		const csvContent =
			"data:text/csv;charset=utf-8," +
			Object.keys(csv[0]).join(",") +
			"\n" +
			csv.map((row) => Object.values(row).join(",")).join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "transaction_history.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Transaction filtering
	const getFilteredTransactions = () => {
		return transactions
			.filter((tx) => {
				if (
					filters.status !== "all" &&
					txStatus(tx.executed) !== filters.status
				)
					return false;
				if (
					searchTerm &&
					!tx.to.toLowerCase().includes(searchTerm.toLowerCase())
				)
					return false;
				// Add more filter logic
				return true;
			})
			.sort((a, b) => {
				return Number(
					sortOrder === "newest"
						? b.timestamp - a.timestamp
						: a.timestamp - b.timestamp
				);
			});
	};

	// Enhanced UI Components
	const TransactionFilters = () => (
		<div className='flex gap-4 mb-6 items-center'>
			<div className='relative flex-1'>
				<Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
				<input
					name='transaction'
					type='text'
					placeholder='Search transactions...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200'
				/>
			</div>
			<select
				value={filters.status}
				name='filters'
				onChange={(e) => setFilters({ ...filters, status: e.target.value })}
				className='px-4 py-2 rounded-xl border border-gray-200'>
				<option value='all'>All Status</option>
				<option value='pending'>Pending</option>
				<option value='executed'>Executed</option>
				<option value='failed'>Failed</option>
			</select>
			<select
				value={sortOrder}
				name='orders'
				onChange={(e) => setSortOrder(e.target.value)}
				className='px-4 py-2 rounded-xl border border-gray-200'>
				<option value='newest'>Newest First</option>
				<option value='oldest'>Oldest First</option>
			</select>
			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={exportTransactionHistory}
				className='p-2 bg-gray-100 rounded-lg'>
				<Download className='h-5 w-5' />
			</motion.button>
		</div>
	);

	const TransactionList = () => {
		return (
			<div className='space-y-4'>
				{getFilteredTransactions().map((tx) => (
					<TransactionCard
						key={tx.txHash}
						tx={tx}
					/>
				))}
			</div>
		);
	};

	// Main render
	return (
		<Fragment>
			<ProjectHeader title='Multi-Signature Wallet'>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='px-4 py-2 bg-blue-500 text-white rounded-xl'
					onClick={() => setActiveTab("settings")}>
					<Settings className='h-5 w-5' />
				</motion.button>
			</ProjectHeader>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='min-h-screen py-12  bg-gray-50'>
				<div className='max-w-7xl mx-auto px-4 md:px-8'>
					{/* Header Section */}
					{/* Enhanced Stats Grid */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
						<div className='bg-white p-6 rounded-2xl shadow-lg'>
							<h3 className='text-lg font-medium text-gray-800 mb-2'>
								Wallet Balance
							</h3>
							<p className='text-3xl font-bold text-blue-500'>
								{walletBalance}
							</p>
						</div>
						<div className='bg-white p-6 rounded-2xl shadow-lg'>
							<h3 className='text-lg font-medium text-gray-800 mb-2'>
								Required Signatures
							</h3>
							<p className='text-3xl font-bold text-blue-500'>
								{padZero(requiredSignatures)}
							</p>
						</div>
						<div className='bg-white p-6 rounded-2xl shadow-lg'>
							<h3 className='text-lg font-medium text-gray-800 mb-2'>
								Total Owners
							</h3>
							<p className='text-3xl font-bold text-blue-500'>
								{padZero(owners.length)}
							</p>
						</div>
						<div className='bg-white p-6 rounded-2xl shadow-lg'>
							<h3 className='text-lg font-medium text-gray-800 mb-2'>
								Pending Transactions
							</h3>
							<p className='text-3xl font-bold text-blue-500'>
								{padZero(
									transactions.filter((tx) => !tx.executed).length
								)}
							</p>
						</div>
					</motion.div>

					<div className='bg-white p-6 rounded-2xl shadow-lg'>
						{/* Enhanced Tab Navigation */}
						<div className='flex gap-4 mb-6'>
							<button
								className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
									activeTab === "transactions"
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-600"
								}`}
								onClick={() => setActiveTab("transactions")}>
								<Send className='h-5 w-5' />
								Transactions
							</button>
							<button
								className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
									activeTab === "submit"
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-600"
								}`}
								onClick={() => setActiveTab("submit")}>
								<Upload className='h-5 w-5' />
								Submit Transaction
							</button>
							<button
								className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
									activeTab === "settings"
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-600"
								}`}
								onClick={() => setActiveTab("settings")}>
								<Settings className='h-5 w-5' />
								Settings
							</button>
						</div>

						{/* Transaction List with Filters */}
						{activeTab === "transactions" && (
							<>
								<TransactionFilters />
								<TransactionList />
							</>
						)}

						{/* Enhanced Submit Transaction Form */}
						{activeTab === "submit" && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className='space-y-4'>
								<div className='relative'>
									<Wallet className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
									<input
										name='address'
										ref={addressRef}
										type='text'
										placeholder='Recipient address (0x...)'
										className='w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                    text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
									/>
								</div>
								<div className='relative'>
									<Send className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
									<input
										name='amount'
										ref={amountRef}
										type='text'
										placeholder='Amount in ETH'
										className='w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                    text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
									/>
								</div>
								<div className='relative'>
									<AlertTriangle className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
									<input
										name='description'
										ref={descriptionRef}
										type='text'
										placeholder='Transaction description (optional)'
										className='w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                    text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
									/>
								</div>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 
                  hover:bg-blue-600 rounded-xl text-white font-medium shadow-lg 
                  shadow-blue-500/20 transition-colors duration-200'
									onClick={submitTransaction}
									disabled={isLoading}>
									{isLoading ? (
										<RefreshCw className='h-5 w-5 animate-spin' />
									) : (
										<Send className='h-5 w-5' />
									)}
									Submit Transaction
								</motion.button>
							</motion.div>
						)}

						{/* Enhanced Settings Panel */}
						{activeTab === "settings" && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className='space-y-6'>
								{/* Update Required Signatures */}
								<div className='space-y-4'>
									<h3 className='text-lg font-medium text-gray-800'>
										Update Required Signatures
									</h3>
									<div className='flex gap-4'>
										<input
											name='signature'
											ref={newSignaturesRef}
											type='number'
											min='2'
											max={owners.length}
											placeholder='New required signatures'
											className='flex-1 px-4 py-2 rounded-xl border border-gray-200'
										/>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className='px-6 py-2 bg-blue-500 text-white rounded-xl'
											onClick={() => {}}>
											Update
										</motion.button>
									</div>
								</div>

								{/* Owner Management */}
								<div className='space-y-4'>
									<h3 className='text-lg font-medium text-gray-800'>
										Add Owner
									</h3>
									<div className='flex gap-4'>
										<input
											name='owner'
											ref={newOwnerRef}
											type='text'
											placeholder='New owner address (0x...)'
											className='flex-1 px-4 py-2 rounded-xl border border-gray-200'
										/>
										<select
											name='owner-role'
											ref={ownerRoleRef}
											className='px-4 py-2 rounded-xl border border-gray-200'>
											<option value='regular'>Regular Owner</option>
											<option value='admin'>Admin</option>
										</select>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className='px-6 py-2 bg-blue-500 text-white rounded-xl'
											onClick={addNewOwner}>
											Add Owner
										</motion.button>
									</div>
								</div>

								{/* Current Owners List */}
								<div className='space-y-4'>
									<h3 className='text-lg font-medium text-gray-800'>
										Current Owners
									</h3>
									<div className='space-y-2'>
										{owners.map((owner, index) => (
											<div
												key={index}
												className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
												<div className='flex items-center gap-2'>
													<Users className='h-5 w-5 text-gray-400' />
													<span className='text-gray-700'>
														{owner}
													</span>
												</div>
												<motion.button
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className='p-2 text-red-500 hover:bg-red-50 rounded-lg'>
													<Trash2 className='h-5 w-5' />
												</motion.button>
											</div>
										))}
									</div>
								</div>
							</motion.div>
						)}
					</div>

					{/* Confirmation Dialog */}
					<AnimatePresence>
						{showConfirmDialog && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
								<motion.div
									initial={{ scale: 0.9, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.9, opacity: 0 }}
									className='bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4'>
									<h3 className='text-xl font-semibold text-gray-800 mb-4'>
										Confirm Action
									</h3>
									<p className='text-gray-600 mb-6'>
										Are you sure you want to proceed with this action?
									</p>
									<div className='flex justify-end gap-4'>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className='px-4 py-2 bg-gray-100 rounded-lg text-gray-600'
											onClick={() => setShowConfirmDialog(false)}>
											Cancel
										</motion.button>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className='px-4 py-2 bg-red-500 text-white rounded-lg'
											onClick={() => {
												// Handle confirmation
												setShowConfirmDialog(false);
											}}>
											Confirm
										</motion.button>
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</Fragment>
	);
};

export default MultisigWallet;

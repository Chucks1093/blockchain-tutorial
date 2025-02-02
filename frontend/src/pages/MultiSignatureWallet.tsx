import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	MuliSigWalletService,
	useContractService,
} from "@/components/multisign/MultisigWalletService";
import {
	Wallet,
	Send,
	Users,
	CheckCircle,
	Settings,
	AlertTriangle,
	Download,
	Upload,
	Search,
	Trash2,
	RefreshCw,
} from "lucide-react";

import { ConnectKitButton } from "connectkit";
import { showToast } from "@/lib/utils";

interface Transaction {
	id: number;
	to: string;
	amount: string;
	approvals: number;
	required: number;
	status: string;
	description: string;
	timestamp: number;
	approvers: string[];
	nonce: number;
}

const MultisigWallet = () => {
	// Enhanced state management
	const [transactions, setTransactions] = useState<Transaction[]>([
		{
			id: 1,
			to: "0x123...",
			amount: "1.5 ETH",
			approvals: 2,
			required: 3,
			status: "pending",
			description: "Treasury payment",
			timestamp: Date.now(),
			approvers: ["0x789...", "0xabc..."],
			nonce: 1,
		},
	]);

	const contractService = useContractService(MuliSigWalletService);
	const [requiredSignatures, setRequiredSignatures] = useState<number>(3);
	const [owners, setOwners] = useState<string[]>([
		"0x789...",
		"0xabc...",
		"0xdef...",
	]);

	const [activeTab, setActiveTab] = useState<string>("transactions");
	const [walletBalance, setWalletBalance] = useState<string>("10.5 ETH");
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
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

	// Additional refs for new features
	const addressRef = useRef<HTMLInputElement>(null);
	const amountRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);
	const newSignaturesRef = useRef<HTMLInputElement>(null);
	const newOwnerRef = useRef<HTMLInputElement>(null);
	const ownerRoleRef = useRef<HTMLInputElement>(null);

	// Enhanced transaction management
	const submitTransaction = async () => {
		if (
			!addressRef.current?.value ||
			!amountRef.current?.value ||
			!descriptionRef.current?.value
		) {
			// Show error toast
			return showToast.error("Fill all input");
		}

		showToast.loading("Submitting Transaction");

		setIsLoading(true);
		try {
			// Contract interaction logic here
			const newTransaction = {
				to: addressRef.current.value,
				amount: amountRef.current.value,
				description: descriptionRef.current?.value || "",
			};
			const submittedTransaction = await contractService.submitTransaction(
				newTransaction.to,
				newTransaction.amount,
				newTransaction.description
			);
			console.log(submittedTransaction);
			// setTransactions([...transactions, submittedTransaction]);

			// Reset form
			addressRef.current.value = "";
			amountRef.current.value = "";
			showToast.success("Transaction submitted successfully");
		} catch (error) {
			showToast.error("Transaction submission failed");
			console.error("Transaction submission failed:", error);
			// Show error toast
		} finally {
			setIsLoading(false);
		}
	};

	// Batch transaction approval
	const approveBatch = async (selectedIds: number[]): Promise<void> => {
		setIsLoading(true);
		try {
			// Contract interaction for batch approval
			// Update state after successful approval
		} catch (error) {
			console.error("Batch approval failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Transaction history export
	const exportTransactionHistory = () => {
		const csv = transactions.map((tx) => ({
			ID: tx.id,
			To: tx.to,
			Amount: tx.amount,
			Status: tx.status,
			Approvals: `${tx.approvals}/${tx.required}`,
			Timestamp: new Date(tx.timestamp).toLocaleString(),
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
				if (filters.status !== "all" && tx.status !== filters.status)
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
				return sortOrder === "newest"
					? b.timestamp - a.timestamp
					: a.timestamp - b.timestamp;
			});
	};

	// Owner management
	const addOwner = async () => {
		if (!newOwnerRef.current?.value) return;

		setIsLoading(true);
		try {
			// Contract interaction for adding owner
			const newOwner = newOwnerRef.current.value;
			await contractService.addNewOwner(newOwner);
			setOwners([...owners, newOwner]);
			newOwnerRef.current.value = "";
		} catch (error) {
			console.error("Failed to add owner:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const removeOwner = async (ownerAddress) => {
		setShowConfirmDialog(true);
		// Show confirmation dialog before removal
	};

	// Enhanced UI Components
	const TransactionFilters = () => (
		<div className='flex gap-4 mb-6 items-center'>
			<div className='relative flex-1'>
				<Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
				<input
					type='text'
					placeholder='Search transactions...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200'
				/>
			</div>
			<select
				value={filters.status}
				onChange={(e) => setFilters({ ...filters, status: e.target.value })}
				className='px-4 py-2 rounded-xl border border-gray-200'>
				<option value='all'>All Status</option>
				<option value='pending'>Pending</option>
				<option value='executed'>Executed</option>
				<option value='failed'>Failed</option>
			</select>
			<select
				value={sortOrder}
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

	const TransactionList = () => (
		<div className='space-y-4'>
			{getFilteredTransactions().map((tx) => (
				<motion.div
					key={tx.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors'>
					<div className='flex justify-between items-center'>
						<div>
							<p className='text-sm text-gray-500'>To: {tx.to}</p>
							<p className='text-lg font-medium text-gray-800'>
								{tx.amount}
							</p>
							<p className='text-sm text-gray-600'>{tx.description}</p>
						</div>
						<div className='flex flex-col items-end gap-2'>
							<span className='text-sm text-gray-500'>
								{tx.approvals}/{tx.required} approvals
							</span>
							<div className='flex gap-2'>
								{tx.status === "pending" && (
									<>
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className='p-2 bg-green-500 text-white rounded-lg'
											onClick={() => approveTransaction(tx.id)}>
											<CheckCircle className='h-5 w-5' />
										</motion.button>
										{tx.approvals >= tx.required && (
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className='p-2 bg-blue-500 text-white rounded-lg'
												onClick={() => executeTransaction(tx.id)}>
												<Send className='h-5 w-5' />
											</motion.button>
										)}
									</>
								)}
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className='p-2 bg-gray-100 rounded-lg'
									onClick={() => setSelectedTransaction(tx)}>
									<Search className='h-5 w-5' />
								</motion.button>
							</div>
						</div>
					</div>
					{/* Transaction Details Expansion Panel */}
					<AnimatePresence>
						{selectedTransaction?.id === tx.id && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className='mt-4 pt-4 border-t border-gray-100'>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<h4 className='text-sm font-medium text-gray-600'>
											Nonce
										</h4>
										<p className='text-gray-800'>{tx.nonce}</p>
									</div>
									<div>
										<h4 className='text-sm font-medium text-gray-600'>
											Timestamp
										</h4>
										<p className='text-gray-800'>
											{new Date(tx.timestamp).toLocaleString()}
										</p>
									</div>
									<div className='col-span-2'>
										<h4 className='text-sm font-medium text-gray-600'>
											Approvers
										</h4>
										<div className='flex flex-wrap gap-2 mt-2'>
											{tx.approvers.map((approver, idx) => (
												<span
													key={idx}
													className='px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600'>
													{approver}
												</span>
											))}
										</div>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			))}
		</div>
	);

	// Main render
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='min-h-screen py-12 px-4 sm:px-6 bg-gray-50'>
			<div className='max-w-6xl mx-auto'>
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className='flex items-center justify-between mb-8'>
					<ConnectKitButton />
					<motion.h1
						className='text-3xl font-semibold text-gray-500 tracking-tight'
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 200 }}>
						Multi-Signature Wallet
					</motion.h1>
					<div className='flex gap-4'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='px-4 py-2 bg-blue-500 text-white rounded-xl'
							onClick={() => setActiveTab("settings")}>
							<Settings className='h-5 w-5' />
						</motion.button>
					</div>
				</motion.div>
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
							{requiredSignatures}
						</p>
					</div>
					<div className='bg-white p-6 rounded-2xl shadow-lg'>
						<h3 className='text-lg font-medium text-gray-800 mb-2'>
							Total Owners
						</h3>
						<p className='text-3xl font-bold text-blue-500'>
							{owners.length}
						</p>
					</div>
					<div className='bg-white p-6 rounded-2xl shadow-lg'>
						<h3 className='text-lg font-medium text-gray-800 mb-2'>
							Pending Transactions
						</h3>
						<p className='text-3xl font-bold text-blue-500'>
							{
								transactions.filter((tx) => tx.status === "pending")
									.length
							}
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
								activeTab === "batch"
									? "bg-blue-500 text-white"
									: "bg-gray-100 text-gray-600"
							}`}
							onClick={() => setActiveTab("batch")}>
							<CheckCircle className='h-5 w-5' />
							Batch Approve
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

					{/* Batch Approval Interface */}
					{activeTab === "batch" && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='space-y-4'>
							<h3 className='text-lg font-medium text-gray-800 mb-4'>
								Batch Transaction Approval
							</h3>
							<div className='space-y-4'>
								{transactions
									.filter((tx) => tx.status === "pending")
									.map((tx) => (
										<div
											key={tx.id}
											className='flex items-center justify-between p-4 rounded-xl border border-gray-200'>
											<div className='flex items-center gap-4'>
												<input
													type='checkbox'
													className='w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500'
												/>
												<div>
													<p className='text-sm text-gray-500'>
														To: {tx.to}
													</p>
													<p className='text-lg font-medium text-gray-800'>
														{tx.amount}
													</p>
												</div>
											</div>
											<span className='text-sm text-gray-500'>
												{tx.approvals}/{tx.required} approvals
											</span>
										</div>
									))}
							</div>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 
                  hover:bg-green-600 rounded-xl text-white font-medium shadow-lg 
                  shadow-green-500/20 transition-colors duration-200'
								onClick={() => approveBatch([])}
								disabled={isLoading}>
								{isLoading ? (
									<RefreshCw className='h-5 w-5 animate-spin' />
								) : (
									<CheckCircle className='h-5 w-5' />
								)}
								Approve Selected Transactions
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
										ref={newSignaturesRef}
										type='number'
										min='1'
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
										ref={newOwnerRef}
										type='text'
										placeholder='New owner address (0x...)'
										className='flex-1 px-4 py-2 rounded-xl border border-gray-200'
									/>
									<select
										ref={ownerRoleRef}
										className='px-4 py-2 rounded-xl border border-gray-200'>
										<option value='regular'>Regular Owner</option>
										<option value='admin'>Admin</option>
									</select>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className='px-6 py-2 bg-blue-500 text-white rounded-xl'
										onClick={addOwner}>
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
												className='p-2 text-red-500 hover:bg-red-50 rounded-lg'
												onClick={() => removeOwner(owner)}>
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
	);
};

export default MultisigWallet;

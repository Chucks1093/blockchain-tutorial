import { useState, Fragment } from "react";
import {
	ChevronDown,
	Clock,
	CheckCircle,
	Calendar,
	Link as LinkIcon,
	Pause,
	Play,
	PlusCircle,
	XCircle,
	AlertCircle,
	DollarSign,
	X,
	ExternalLink,
} from "lucide-react";
import { Link, useParams } from "react-router";
import makeBlockie from "ethereum-blockies-base64";
import CopyButton from "../common/CopyButton";
import HistoryTable from "./HistoryCard";
import { motion, AnimatePresence } from "framer-motion";

const StatusBadge = ({ status }: { status: string }) => {
	return (
		<div className='flex items-center'>
			<span
				className={`flex items-center ${
					status === "active"
						? "text-green-500"
						: status === "pending"
						? "text-yellow-500"
						: status === "paused"
						? "text-blue-500"
						: status === "depleted" || status === "cancelled"
						? "text-red-500"
						: "text-gray-500"
				}`}>
				{status === "active" ? (
					<CheckCircle className='h-5 w-5 mr-1' />
				) : status === "paused" ? (
					<Pause className='h-5 w-5 mr-1' />
				) : status === "depleted" || status === "cancelled" ? (
					<XCircle className='h-5 w-5 mr-1' />
				) : (
					<Clock className='h-5 w-5 mr-1' />
				)}
				<span className='capitalize'>{status}</span>
			</span>
		</div>
	);
};

// Modal component for funding upkeep
const FundUpkeepModal = ({
	isOpen,
	onClose,
	onConfirm,
	currentBalance,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (amount: number) => void;
	currentBalance: string;
}) => {
	const [amount, setAmount] = useState<string>("1.0");

	if (!isOpen) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				className='bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4'>
				<div className='flex justify-between items-center mb-4'>
					<h3 className='text-xl font-semibold text-gray-800'>
						Fund Upkeep
					</h3>
					<button
						onClick={onClose}
						className='text-gray-500 hover:text-gray-700'>
						<X className='h-5 w-5' />
					</button>
				</div>

				<div className='mb-6'>
					<p className='text-gray-600 mb-4'>
						Add LINK tokens to fund this upkeep. The current balance is{" "}
						{currentBalance}.
					</p>

					<div className='space-y-4'>
						<div className='bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start'>
							<div className='bg-blue-500 p-2 rounded-lg mr-3'>
								<LinkIcon className='h-5 w-5 text-white' />
							</div>
							<div>
								<h3 className='font-medium text-gray-700'>
									LINK Token
								</h3>
								<p className='text-xs text-gray-500'>
									Required for Chainlink Automation
								</p>
							</div>
						</div>

						<div className='relative mt-4'>
							<div className='absolute right-4 top-1/2 -translate-y-1/2 font-medium text-gray-500'>
								LINK
							</div>
							<input
								type='number'
								step='0.1'
								min='0.1'
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className='w-full pr-16 pl-4 py-3 rounded-xl bg-white border border-gray-200 
                  text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                  focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
							/>
						</div>

						<div className='mt-1 flex justify-between text-sm'>
							<span className='text-gray-500'>Estimated duration</span>
							<span className='font-medium text-gray-700'>
								~{(parseFloat(amount) * 30).toFixed(0)} days
							</span>
						</div>
					</div>
				</div>

				<div className='flex justify-end gap-3'>
					<button
						onClick={onClose}
						className='px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200'>
						Cancel
					</button>
					<button
						onClick={() => onConfirm(parseFloat(amount))}
						className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center'>
						<DollarSign className='h-4 w-4 mr-1' />
						Add Funds
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
};

// Confirmation dialog component
const ConfirmationDialog = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	actionText,
	actionColor = "red",
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	actionText: string;
	actionColor?: "red" | "blue" | "yellow";
}) => {
	if (!isOpen) return null;

	const colorClasses = {
		red: "bg-red-500 hover:bg-red-600",
		blue: "bg-blue-500 hover:bg-blue-600",
		yellow: "bg-yellow-500 hover:bg-yellow-600",
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				className='bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4'>
				<h3 className='text-xl font-semibold text-gray-800 mb-4'>
					{title}
				</h3>
				<p className='text-gray-600 mb-6'>{message}</p>
				<div className='flex justify-end gap-4'>
					<button
						className='px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200'
						onClick={onClose}>
						Cancel
					</button>
					<button
						className={`px-4 py-2 text-white rounded-lg ${colorClasses[actionColor]}`}
						onClick={onConfirm}>
						{actionText}
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
};

// Balance indicator component
const BalanceIndicator = ({
	balance,
	minBalance,
}: {
	balance: string;
	minBalance: string;
}) => {
	const balanceValue = parseFloat(balance.replace(" LINK", ""));
	const minBalanceValue = parseFloat(minBalance.replace(" LINK", ""));
	const percentage = Math.min(
		100,
		Math.max(0, (balanceValue / (minBalanceValue * 5)) * 100)
	);

	let colorClass = "bg-green-500";
	if (percentage < 30) {
		colorClass = "bg-red-500";
	} else if (percentage < 60) {
		colorClass = "bg-yellow-500";
	}

	return (
		<div className='space-y-1'>
			<div className='flex justify-between text-sm'>
				<span className='text-gray-500'>Current Balance</span>
				<span className='font-medium text-gray-800'>{balance}</span>
			</div>
			<div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
				<div
					className={`h-full ${colorClass} rounded-full`}
					style={{ width: `${percentage}%` }}></div>
			</div>
			<div className='flex justify-between text-xs'>
				<span className='text-gray-500'>Min Required: {minBalance}</span>
				<span className='text-gray-500'>
					{balanceValue <= minBalanceValue
						? "Critically low"
						: balanceValue <= minBalanceValue * 2
						? "Running low"
						: "Healthy"}
				</span>
			</div>
		</div>
	);
};

// Actions menu component
const ActionsMenu = ({
	isOpen,
	onClose,
	upkeepStatus,
	onPauseResume,
	onFund,
	onCancel,
}: {
	isOpen: boolean;
	onClose: () => void;
	upkeepStatus: string;
	onPauseResume: () => void;
	onFund: () => void;
	onCancel: () => void;
}) => {
	if (!isOpen) return null;

	const isPaused = upkeepStatus === "paused";
	const isCancelled =
		upkeepStatus === "cancelled" || upkeepStatus === "depleted";

	return (
		<div className='absolute right-0 mt-2 py-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
			{!isCancelled && (
				<>
					<button
						className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
						onClick={() => {
							onPauseResume();
							onClose();
						}}>
						{isPaused ? (
							<>
								<Play className='mr-2 h-4 w-4 text-green-500' /> Resume
								Upkeep
							</>
						) : (
							<>
								<Pause className='mr-2 h-4 w-4 text-blue-500' /> Pause
								Upkeep
							</>
						)}
					</button>
					<button
						className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
						onClick={() => {
							onFund();
							onClose();
						}}>
						<PlusCircle className='mr-2 h-4 w-4 text-green-500' /> Add
						Funds
					</button>
					<div className='border-t border-gray-100 my-1'></div>
				</>
			)}
			{!isCancelled && (
				<button
					className='flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
					onClick={() => {
						onCancel();
						onClose();
					}}>
					<XCircle className='mr-2 h-4 w-4' /> Cancel Upkeep
				</button>
			)}
			{isCancelled && (
				<div className='px-4 py-2 text-sm text-gray-500 italic'>
					This upkeep has been cancelled
				</div>
			)}
		</div>
	);
};

// Shortened address component with icon
const AddressDisplay = ({ address }: { address: string }) => {
	const shortAddress = address
		? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
		: "";

	return (
		<div className='flex items-center gap-1'>
			<img
				src={makeBlockie(address || "")}
				className='w-7 h-7 rounded-md mr-1 object-cover'
				alt='avatar'
			/>
			<span className='font-manrope text-md font-medium text-blue-500 cursor-pointer'>
				{shortAddress}
			</span>
			<CopyButton textToCopy={address} />
		</div>
	);
};

function UpKeepDetails() {
	const { id } = useParams();
	console.log(id);
	const [actionsMenuOpen, setActionsMenuOpen] = useState<boolean>(false);
	const [showFundModal, setShowFundModal] = useState<boolean>(false);
	const [showPauseResumeConfirm, setShowPauseResumeConfirm] =
		useState<boolean>(false);
	const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

	// Simulate getting upkeep details - in real app, this would be fetched based on id
	const [selectedUpkeep, setSelectedUpkeep] = useState({
		id: "926927...25568555",
		status: "active",
		address: "0x3212074bf50639c15a3bbd65045845f9a047687",
		registry: "v2.1",
		balance: "1 LINK",
		gasLimit: 500000,
		date: "February 27, 2025",
		time: "13:25 UTC",
		owner: "0x13d8...Fd4d",
		txHash: "0xaf4f...9003",
		type: "Custom",
		minBalance: "0.4931542400039849 LINK",
		totalSpent: "0 LINK",
		name: "Token Vesting",
		upTime: "354 hrs",
		nextExecutionTime: "3h 24m",
		executionCount: 14,
	});

	// Handle upkeep actions
	const handlePauseResume = () => {
		// Here we would update the upkeep status - for now just simulate it
		setSelectedUpkeep((prev) => ({
			...prev,
			status: prev.status === "active" ? "paused" : "active",
		}));
	};

	const handleFundUpkeep = (amount: number) => {
		// Here we would call a function to fund the upkeep - for now just simulate it
		const currentBalance = parseFloat(
			selectedUpkeep.balance.replace(" LINK", "")
		);
		setSelectedUpkeep((prev) => ({
			...prev,
			balance: `${(currentBalance + amount).toFixed(2)} LINK`,
		}));
		setShowFundModal(false);
	};

	const handleCancelUpkeep = () => {
		// Here we would call a function to cancel the upkeep - for now just simulate it
		setSelectedUpkeep((prev) => ({
			...prev,
			status: "cancelled",
		}));
		setShowCancelConfirm(false);
	};

	return (
		<Fragment>
			{/* Fund Upkeep Modal */}
			<AnimatePresence>
				{showFundModal && (
					<FundUpkeepModal
						isOpen={showFundModal}
						onClose={() => setShowFundModal(false)}
						onConfirm={handleFundUpkeep}
						currentBalance={selectedUpkeep.balance}
					/>
				)}
			</AnimatePresence>

			{/* Pause/Resume Confirmation Dialog */}
			<AnimatePresence>
				{showPauseResumeConfirm && (
					<ConfirmationDialog
						isOpen={showPauseResumeConfirm}
						onClose={() => setShowPauseResumeConfirm(false)}
						onConfirm={handlePauseResume}
						title={
							selectedUpkeep.status === "active"
								? "Pause Upkeep"
								: "Resume Upkeep"
						}
						message={
							selectedUpkeep.status === "active"
								? "Are you sure you want to pause this upkeep? It will stop executing until resumed."
								: "Are you sure you want to resume this upkeep? It will start executing on schedule again."
						}
						actionText={
							selectedUpkeep.status === "active" ? "Pause" : "Resume"
						}
						actionColor={
							selectedUpkeep.status === "active" ? "yellow" : "blue"
						}
					/>
				)}
			</AnimatePresence>

			{/* Cancel Confirmation Dialog */}
			<AnimatePresence>
				{showCancelConfirm && (
					<ConfirmationDialog
						isOpen={showCancelConfirm}
						onClose={() => setShowCancelConfirm(false)}
						onConfirm={handleCancelUpkeep}
						title='Cancel Upkeep'
						message='Are you sure you want to cancel this upkeep? This action cannot be undone, and any remaining LINK will be returned to your wallet.'
						actionText='Cancel Upkeep'
						actionColor='red'
					/>
				)}
			</AnimatePresence>

			<div className='max-w-7xl mx-auto px-4 md:px-8 py-4'>
				<div className='flex justify-between items-center border-b border-gray-100 my-6'>
					<div className=''>
						<Link
							to='/automator'
							className='mb-3 text-blue-500 block'>
							Home /
						</Link>
						<h1 className='text-3xl font-medium'>
							Upkeep {selectedUpkeep.id}
						</h1>
					</div>
					<div className='relative'>
						<button
							className='px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center'
							onClick={() => setActionsMenuOpen(!actionsMenuOpen)}>
							Actions
							<ChevronDown className='ml-2 h-4 w-4' />
						</button>

						{actionsMenuOpen && (
							<ActionsMenu
								isOpen={actionsMenuOpen}
								onClose={() => setActionsMenuOpen(false)}
								upkeepStatus={selectedUpkeep.status}
								onPauseResume={() => setShowPauseResumeConfirm(true)}
								onFund={() => setShowFundModal(true)}
								onCancel={() => setShowCancelConfirm(true)}
							/>
						)}
					</div>
				</div>

				<div className='p-6 border-gray-200 bg-white border rounded-lg shadow-sm'>
					<div className='grid grid-cols-4 gap-8 gap-y-[3.8rem] relative'>
						<hr className='absolute border border-gray-100 w-full top-1/2 -translate-y-1/2' />
						<div>
							<h3 className='text-gray-500 mb-2'>Status</h3>
							<StatusBadge status={selectedUpkeep.status} />
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Name</h3>
							<p className='font-medium'>{selectedUpkeep.name}</p>
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Up Time</h3>
							<p className='font-medium'>{selectedUpkeep.upTime}</p>
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Next Execution</h3>
							<p className='font-medium'>
								{selectedUpkeep.status === "active"
									? selectedUpkeep.nextExecutionTime
									: "—"}
							</p>
						</div>
						<div>
							<div className='flex items-center mb-2'>
								<h3 className='text-gray-500'>Registry address</h3>
								<span className='ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md'>
									{selectedUpkeep.registry}
								</span>
							</div>
							<AddressDisplay address={selectedUpkeep.address} />
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Total spent</h3>
							<p className='font-medium'>{selectedUpkeep.totalSpent}</p>
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Function</h3>
							<p className='font-medium'>performUpkeep()</p>
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Executions</h3>
							<p className='font-medium'>
								{selectedUpkeep.executionCount}
							</p>
						</div>
					</div>
				</div>

				{/* Added Balance Card */}
				<div className='mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm'>
					<div className='flex justify-between items-start mb-4'>
						<h3 className='text-lg font-medium text-gray-800'>
							LINK Balance
						</h3>
						<button
							onClick={() => setShowFundModal(true)}
							className='px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center'
							disabled={
								selectedUpkeep.status === "cancelled" ||
								selectedUpkeep.status === "depleted"
							}>
							<PlusCircle className='h-4 w-4 mr-1' />
							Add Funds
						</button>
					</div>

					<BalanceIndicator
						balance={selectedUpkeep.balance}
						minBalance={selectedUpkeep.minBalance}
					/>

					<div className='mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500'>
						<div className='flex items-center'>
							<AlertCircle className='h-4 w-4 mr-1 text-yellow-500' />
							<span>
								Automation requires a minimum balance of{" "}
								{selectedUpkeep.minBalance} to operate.
							</span>
						</div>

						<a
							href='https://docs.chain.link/chainlink-automation/cost-estimator'
							target='_blank'
							rel='noopener noreferrer'
							className='text-blue-500 hover:underline flex items-center ml-auto'>
							Cost Estimator
							<ExternalLink className='h-3 w-3 ml-1' />
						</a>
					</div>
				</div>

				<div className='py-6 mt-6'>
					<h2 className='text-3xl font-medium mb-6 flex items-center'>
						Details
					</h2>

					<div className='grid grid-cols-3 gap-6'>
						<div className=' p-6 rounded-lg bg-white shadow-sm border border-gray-200'>
							<h3 className='text-lg font-medium mb-4 flex items-center justify-between'>
								Registration
								<Calendar className='ml-2 h-5 w-5 text-blue-500' />
							</h3>
							<div className='space-y-2'>
								<div className='border-b border-gray-200 pb-4 pt-1'>
									<h4 className='text-gray-500 mb-2 font-medium '>
										Owner address
									</h4>
									<AddressDisplay address={selectedUpkeep.owner} />
								</div>
								<div className='border-b border-gray-200 pb-4 pt-1'>
									<h4 className='text-gray-500 mb-2 font-medium '>
										Date
									</h4>
									<p>
										{selectedUpkeep.date} at {selectedUpkeep.time}
									</p>
								</div>
								<div className=' pb-4 pt-1'>
									<h4 className='text-gray-500 mb-2 font-medium '>
										Transaction Hash
									</h4>
									<div className='flex items-center text-blue-500'>
										<span className='font-mono text-sm'>
											{selectedUpkeep.txHash}
										</span>
										<CopyButton textToCopy={selectedUpkeep.txHash} />
									</div>
								</div>
							</div>
						</div>

						<div className=' p-6 rounded-lg bg-white shadow-sm border border-gray-200'>
							<h3 className='text-lg font-medium mb-4 flex items-center justify-between'>
								Upkeep
								<Clock className='ml-2 h-5 w-5 text-blue-500' />
							</h3>
							<div className='space-y-2'>
								<div className='border-b border-gray-200 pb-4 pt-1'>
									<h4 className='text-gray-500 mb-2 font-medium '>
										ID
									</h4>
									<div className='flex items-center'>
										<span className='font-mono text-sm'>
											{selectedUpkeep.id}
										</span>
										<CopyButton textToCopy={selectedUpkeep.id} />
									</div>
								</div>
								<div className='border-b border-gray-200 pb-4 pt-1'>
									<h4 className='text-gray-500 mb-2 font-medium '>
										Upkeep address
									</h4>
									<AddressDisplay address={selectedUpkeep.address} />
								</div>
								<div className=' pb-4 pt-1'>
									<h4 className='text-gray-500 mb-2 font-medium '>
										Gas limit
									</h4>
									<p>{selectedUpkeep.gasLimit.toLocaleString()}</p>
								</div>
							</div>
						</div>

						<div className='bg-white shadow-sm border border-gray-200 p-6 rounded-lg'>
							<h3 className='text-lg font-medium mb-4 flex items-center justify-between'>
								Trigger
								<LinkIcon className='ml-2 h-5 w-5 text-blue-500' />
							</h3>
							<div className='space-y-4'>
								<div className='border-b border-gray-200 pb-4 pt-1'>
									<h4 className='text-gray-500 mb-2 font-medium '>
										Type
									</h4>
									<p>{selectedUpkeep.type}</p>
								</div>
								<div>
									<h4 className='text-gray-500 mb-2 font-medium '>
										Check data (Base16)
									</h4>
									<div className='bg-gray-100 p-3 rounded-md text-gray-500 h-20 overflow-y-auto'>
										<p className='font-mono text-sm'>0x</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className='mt-8'>
						<h2 className='text-3xl font-medium mb-6'>History</h2>

						<HistoryTable />

						<div className='flex justify-between items-center mt-4 text-sm'>
							<div>
								<button
									className='px-4 py-2 border border-gray-200 rounded-lg text-gray-500'
									disabled>
									Prev
								</button>
							</div>
							<div className='text-gray-500'>Showing 1 of 1 entries</div>
							<div>
								<button
									className='px-4 py-2 border border-gray-200 rounded-lg text-gray-500'
									disabled>
									Next
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
}

export default UpKeepDetails;

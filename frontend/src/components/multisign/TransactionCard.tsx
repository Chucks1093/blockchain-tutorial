import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
	formatTimestamp,
	handleMultiSigCustomContractError,
	showToast,
} from "@/lib/utils";
import { ChevronDown, CheckCircle, Clock } from "lucide-react";
import { useMultiSigWallet } from "./MultisigWalletService";
import { shortenAddress } from "@/lib/utils";
import { Transaction } from "./MultisigWalletService";
import { formatEther, toUtf8String } from "ethers";

const TransactionCard = ({ tx }: { tx: Transaction }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { contractService, requiredSignatures } = useMultiSigWallet();

	const confirmTx = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await contractService.confirmTransaction(Number(tx.txIndex), tx.from);
			showToast.success("Transaction confirmed successfully");
		} catch (error) {
			const errorMessage = handleMultiSigCustomContractError(
				error,
				contractService.contract
			);
			showToast.error(errorMessage);
		}
	};

	const revokeTx = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await contractService.revokeTransaction(Number(tx.txIndex), tx.from);
			showToast.success("Transaction confirmation revoked");
		} catch (error) {
			const errorMessage = handleMultiSigCustomContractError(
				error,
				contractService.contract
			);
			showToast.error(errorMessage);
		}
	};

	return (
		<motion.div
			onClick={() => setIsExpanded(!isExpanded)}
			className='bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200'>
			{/* Card Header - Always visible */}
			<div className='p-4 flex justify-between items-center'>
				<div className='flex items-center gap-3'>
					<div
						className={`p-2 rounded-full ${
							tx.executed ? "bg-green-100" : "bg-blue-100"
						}`}>
						{tx.executed ? (
							<CheckCircle className='h-5 w-5 text-green-600' />
						) : (
							<Clock className='h-5 w-5 text-blue-600' />
						)}
					</div>
					<div>
						<p className='text-lg font-semibold text-gray-800'>
							{toUtf8String(tx.data)}
						</p>
						<p className='text-sm text-gray-500'>
							{formatTimestamp(tx.timestamp)}
						</p>
					</div>
				</div>

				{/* Status Badge */}
				<div className='flex items-center gap-2'>
					<p className='text-lg font-semibold text-gray-800'>
						{formatEther(tx.amount)} ETH
					</p>
					<span
						className={`px-3 py-1 text-sm rounded-full ${
							tx.executed
								? "bg-green-100 text-green-700"
								: "bg-yellow-100 text-yellow-700"
						}`}>
						{tx.executed
							? "Executed"
							: `${tx.confirmations}/${requiredSignatures} approvals`}
					</span>
					<ChevronDown
						className={`h-4 w-4 transition-transform duration-200 ${
							isExpanded ? "rotate-180" : ""
						}`}
					/>
				</div>
			</div>

			{/* Expandable Details */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0 }}
						animate={{ height: "auto" }}
						exit={{ height: 0 }}
						className='overflow-hidden'>
						<div className='border-t border-gray-100 bg-gray-50 p-4 space-y-4'>
							{/* Transaction Details */}
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-gray-500'>From</p>
									<p className='text-sm font-medium'>
										{shortenAddress(tx.from)}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>To</p>
									<p className='text-sm font-medium'>
										{shortenAddress(tx.to)}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Hash</p>
									<p className='text-sm font-mono'>
										{shortenAddress(tx.txHash)}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Index</p>
									<p className='text-sm font-medium'>
										{Number(tx.txIndex)}
									</p>
								</div>
							</div>

							{/* Action Buttons */}
							{!tx.executed && (
								<div className='flex justify-end gap-2 pt-2'>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={confirmTx}
										className='px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors'>
										Confirm
									</motion.button>

									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={revokeTx}
										className='px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors'>
										Revoke
									</motion.button>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default TransactionCard;

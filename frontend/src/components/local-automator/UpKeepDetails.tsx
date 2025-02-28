import {
	ChevronDown,
	Clock,
	CheckCircle,
	Calendar,
	Link as LinkIcon,
} from "lucide-react";
import { Link, useParams } from "react-router";
import makeBlockie from "ethereum-blockies-base64";
import CopyButton from "../common/CopyButton";
import HistoryTable from "./HistoryCard";
import { Fragment } from "react/jsx-runtime";

const StatusBadge = ({ status }: { status: string }) => {
	return (
		<div className='flex items-center'>
			<span
				className={`flex items-center ${
					status === "active"
						? "text-green-500"
						: status === "pending"
						? "text-yellow-500"
						: "text-red-500"
				}`}>
				<CheckCircle className='h-5 w-5 mr-1' />
				<span className='capitalize'>{status}</span>
			</span>
		</div>
	);
};

const selectedUpkeep = {
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
	return (
		<Fragment>
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
					<div>
						<button className='px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center'>
							Actions
							<ChevronDown className='ml-2 h-4 w-4' />
						</button>
					</div>
				</div>

				<div className='p-6  border-gray-200 bg-white border rounded-lg shadow-sm'>
					<div className='grid grid-cols-4 gap-8 gap-y-[3.8rem] relative '>
						<hr className='absolute border border-gray-100 w-full top-1/2 -translate-y-1/2' />
						<div>
							<h3 className='text-gray-500 mb-2'>Status</h3>
							<StatusBadge status={selectedUpkeep.status} />
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Name</h3>
							<p>Token Vesting</p>
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Up Time</h3>
							<p className='font-medium'>354 hrs</p>
						</div>
						<div>
							<h3 className='text-gray-500 mb-2'>Created At</h3>
							<p className='font-medium'>performUpkeep()</p>
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

// <motion.div
// 			initial={{ opacity: 0, y: 20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			className='min-h-screen py-12 bg-gray-50'>
// 			<div className='max-w-7xl mx-auto px-4 md:px-8'>
// 				{/* Confirmation Dialog */}
// 				<AnimatePresence>
// 					{showConfirmDialog && (
// 						<motion.div
// 							initial={{ opacity: 0 }}
// 							animate={{ opacity: 1 }}
// 							exit={{ opacity: 0 }}
// 							className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
// 							<motion.div
// 								initial={{ scale: 0.9, opacity: 0 }}
// 								animate={{ scale: 1, opacity: 1 }}
// 								exit={{ scale: 0.9, opacity: 0 }}
// 								className='bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4'>
// 								<h3 className='text-xl font-semibold text-gray-800 mb-4'>
// 									Cancel Automation Task
// 								</h3>
// 								<p className='text-gray-600 mb-6'>
// 									Are you sure you want to cancel this automation
// 									task? This action cannot be undone.
// 								</p>
// 								<div className='flex justify-end gap-4'>
// 									<motion.button
// 										whileHover={{ scale: 1.02 }}
// 										whileTap={{ scale: 0.98 }}
// 										className='px-4 py-2 bg-gray-100 rounded-lg text-gray-600'
// 										onClick={() => setShowConfirmDialog(false)}>
// 										Keep Task
// 									</motion.button>
// 									<motion.button
// 										whileHover={{ scale: 1.02 }}
// 										whileTap={{ scale: 0.98 }}
// 										className='px-4 py-2 bg-red-500 text-white rounded-lg'
// 										onClick={confirmCancelTask}>
// 										Cancel Task
// 									</motion.button>
// 								</div>
// 							</motion.div>
// 						</motion.div>
// 					)}
// 				</AnimatePresence>
// 			</div>
// 		</motion.div>

import { CheckCircle, Plus, Clock } from "lucide-react";
import makeBlockie from "ethereum-blockies-base64";
import { motion } from "framer-motion";
import { shortenAddress } from "@/lib/utils";
import CopyButton from "../common/CopyButton";
import { Link } from "react-router";

const UpkeepTable = () => {
	// Updated sample data with name, interval and function
	const upkeeps = [
		{
			id: "589221...2051247",
			name: "Oracle Feed Update",
			status: "active",
			address: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
			interval: "24h",
			function: "performUpkeep()",
			color: "purple",
		},
		{
			id: "531479...89163016",
			name: "Liquidity Rebalancer",
			status: "active",
			address: "0x087a9dfe5c97519b79d7731892e6915c32522a6d",
			interval: "1h",
			function: "checkAndRebalance()",
			color: "green",
		},
		{
			id: "396790...75057773",
			name: "Token Vesting",
			status: "active",
			address: "0xbccbeda63c500a15504fcd0ed12c8c02254a4f78",
			interval: "7d",
			function: "releaseTokens()",
			color: "blue",
		},
		{
			id: "638255...58862247",
			name: "NFT Royalty Distribution",
			status: "active",
			address: "0x6e6f1d2566b622beef37ae9a3ac3e5addfed610d",
			interval: "30d",
			function: "distributeRoyalties()",
			color: "purple",
		},
	];

	// Function to render address icon with appropriate color
	const AddressIcon = ({ address }: { address: string }) => {
		return (
			<img
				src={makeBlockie(address || "")}
				className='w-7 h-7 rounded-md object-cover'
				alt='avatar'
			/>
		);
	};

	return (
		<div className='w-full rounded-lg overflow-hidden'>
			{/* Header Row */}
			<div className='grid grid-cols-[1fr_1fr_8rem_1fr_8rem_1fr] text-left  px-4 py-3'>
				<div className='text-gray-600 font-medium'>ID</div>
				<div className='text-gray-600 font-medium'>Name</div>
				<div className='text-gray-600 font-medium'>Status</div>
				<div className='text-gray-600 font-medium'>Address</div>
				<div className='text-gray-600 font-medium'>Interval</div>
				<div className='text-gray-600 font-medium'>Function</div>
			</div>

			{/* Data Rows */}
			{upkeeps.length > 0 ? (
				<div className='space-y-3 mt-4'>
					{upkeeps.map((upkeep, index) => (
						<Link
							to={`/automator/${upkeep.id}`}
							key={index}
							className='grid grid-cols-[1fr_1fr_8rem_1fr_8rem_1fr] bg-white border shadow-sm hover:bg-gray-50 cursor-pointer rounded-md px-4 py-4'>
							<div>
								<a
									href='#'
									className='text-blue-500 hover:underline font-normal'>
									{upkeep.id}
								</a>
							</div>
							<div className='text-gray-800'>{upkeep.name}</div>
							<div>
								<div className='flex items-center text-green-500'>
									<CheckCircle className='h-5 w-5 mr-1' />
									<span>Active</span>
								</div>
							</div>
							<div>
								<div className='flex items-center'>
									<AddressIcon address={upkeep.address} />
									<span className='ml-2 font-medium text-blue-500 '>
										{shortenAddress(upkeep.address)}
									</span>
									<CopyButton textToCopy={upkeep.address} />
								</div>
							</div>
							<div className='w-[8rem]'>
								<span className='px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-md'>
									{upkeep.interval}
								</span>
							</div>
							<div className='font-mono text-sm text-gray-700'>
								{upkeep.function}
							</div>
						</Link>
					))}
				</div>
			) : (
				<div className='py-12 text-center'>
					<Clock className='h-12 w-12 mx-auto text-gray-300 mb-4' />
					<h3 className='text-xl font-medium text-gray-700 mb-2'>
						No tasks found
					</h3>
					<p className='text-gray-500 mb-6'>
						Create your first Chainlink Automation task to get started
					</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md'>
						<Plus className='h-5 w-5 inline-block mr-2' />
						Create Task
					</motion.button>
				</div>
			)}
		</div>
	);
};

export default UpkeepTable;

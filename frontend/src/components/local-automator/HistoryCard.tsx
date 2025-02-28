import { ChevronDown, Calendar } from "lucide-react";
import CopyButton from "../common/CopyButton";

const HistoryTable = () => {
	// Sample transaction data based on the image
	const transactions = [
		{
			date: "February 27, 2025",
			time: "16:32",
			name: "Oracle Price Update",
			txHash: "0x8494...c8b2",
			fullHash: "0x84945a3d2b35e4f8cf8b29dcee3c8b2",
			amount: "-0.0874392015024737",
			gas: "350,450",
		},
		{
			date: "February 27, 2025",
			time: "16:31",
			name: "Liquidity Rebalance",
			txHash: "0x7b7e...e061",
			fullHash: "0x7b7ebc87d9c1c85343c52e061",
			amount: "-0.1645946019954828",
			gas: "420,890",
		},
		{
			date: "February 27, 2025",
			time: "16:30",
			name: "Yield Distribution",
			txHash: "0x5656...df95",
			fullHash: "0x565672f1a8e3b7c90e3cdf95",
			amount: "-0.1731505741261977",
			gas: "532,104",
		},
		{
			date: "February 27, 2025",
			time: "16:28",
			name: "Collateral Check",
			txHash: "0x8fe2...fc81",
			fullHash: "0x8fe23b6a7d5940c3f8fc81",
			amount: "-0.0998656849602606",
			gas: "285,670",
		},
		{
			date: "February 27, 2025",
			time: "16:25",
			name: "Initial Funding",
			txHash: "0x0b50...0631",
			fullHash: "0x0b50a9e2e8c4de1f70631",
			amount: "2",
			gas: "120,350",
		},
	];

	return (
		<div className='w-full overflow-x-auto  rounded-lg border border-gray-200'>
			{transactions.length > 0 ? (
				<div className='min-w-full'>
					{/* Header Row */}
					<div className='grid grid-cols-5 text-left border-b border-gray-100'>
						<div className='px-4 py-3 text-gray-700 font-medium'>
							<div className='flex items-center'>
								Date{" "}
								<ChevronDown className='ml-1 h-4 w-4 text-gray-500' />
							</div>
						</div>
						<div className='px-4 py-3 text-gray-700 font-medium'>
							Name
						</div>
						<div className='px-4 py-3 text-gray-700 font-medium'>
							Transaction hash
						</div>
						<div className='px-4 py-3 text-gray-700 font-medium'>
							<div className='flex items-center'>
								Amount <span className='text-xs ml-1'>LINK</span>
							</div>
						</div>
						<div className='px-4 py-3 text-gray-700 font-medium'>
							<div className='flex items-center'>
								Gas <span className='text-xs ml-1'>wei</span>
							</div>
						</div>
					</div>

					{/* Data Rows */}
					<div>
						{transactions.map((tx, index) => (
							<div
								key={index}
								className='grid grid-cols-5 border-t border-gray-100 hover:bg-gray-50 bg-white'>
								<div className='px-4 py-4 text-gray-700'>
									{tx.date}, {tx.time}
								</div>
								<div className='px-4 py-4 text-gray-700'>{tx.name}</div>
								<div className='px-4 py-4'>
									<div className='flex items-center text-blue-500'>
										<span className='font-mono'>{tx.txHash}</span>
										<CopyButton textToCopy={tx.fullHash} />
									</div>
								</div>
								<div className='px-4 py-4 text-gray-700'>
									{tx.amount}
								</div>
								<div className='px-4 py-4 text-gray-700'>{tx.gas}</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className='py-12 text-center'>
					<Calendar className='h-12 w-12 mx-auto text-gray-300 mb-4' />
					<h3 className='text-xl font-medium text-gray-700 mb-2'>
						No execution history
					</h3>
					<p className='text-gray-500'>
						Execution history will appear here once your tasks have been
						executed
					</p>
				</div>
			)}
		</div>
	);
};

export default HistoryTable;

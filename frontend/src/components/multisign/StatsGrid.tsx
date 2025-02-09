// import { motion } from "framer-motion";
// import { useState } from "react";
// import { MuliSigWalletService, useContractService } from "./MultisigWalletService";

// function StatsGrid() {
//    const [walletBalance, setWalletBalance] = useState(23);
//    const [requiredSignatures, setRequiredSignatures] = useState(1);
//    const [owners, setOwners] = useState();
//    const contractService = useContractService(MuliSigWalletService);
//    const

// 	return (
// 		<motion.div
// 			initial={{ opacity: 0, y: 20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
// 			<div className='bg-white p-6 rounded-2xl shadow-lg'>
// 				<h3 className='text-lg font-medium text-gray-800 mb-2'>
// 					Wallet Balance
// 				</h3>
// 				<p className='text-3xl font-bold text-blue-500'>{walletBalance} ETH</p>
// 			</div>
// 			<div className='bg-white p-6 rounded-2xl shadow-lg'>
// 				<h3 className='text-lg font-medium text-gray-800 mb-2'>
// 					Required Signatures
// 				</h3>
// 				<p className='text-3xl font-bold text-blue-500'>
// 					{requiredSignatures}
// 				</p>
// 			</div>
// 			<div className='bg-white p-6 rounded-2xl shadow-lg'>
// 				<h3 className='text-lg font-medium text-gray-800 mb-2'>
// 					Total Owners
// 				</h3>
// 				<p className='text-3xl font-bold text-blue-500'>
// 					{contractService.owners.length}
// 				</p>
// 			</div>
// 			<div className='bg-white p-6 rounded-2xl shadow-lg'>
// 				<h3 className='text-lg font-medium text-gray-800 mb-2'>
// 					Pending Transactions
// 				</h3>
// 				<p className='text-3xl font-bold text-blue-500'>
// 					{transactions.filter((tx) => tx.status === "pending").length}
// 				</p>
// 			</div>
// 		</motion.div>
// 	);
// }
// export default StatsGrid;

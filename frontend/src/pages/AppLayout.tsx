import { useAccount, useDisconnect } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useRef, useState, useEffect } from "react";
import { GREETING_CONTRACT_ADDRESS } from "@/lib/constants";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { showToast } from "@/lib/utils";
import { Greeting__factory } from "@/types/contracts/factories/Greeting__factory";
import { Alert } from "@/components/Alert";
import { MessageSquare, Send, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

function AppLayout() {
	const account = useAccount();
	const { disconnect } = useDisconnect();
	const provider = useEthersProvider();
	const signer = useEthersSigner();
	const inputRef = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (provider) {
			showToast.loading("Getting Message...");
			getMessage();
			showToast.success("Message fetched successfully");
		}
	}, [account.isConnected]);

	const getMessage = async () => {
		try {
			setIsLoading(true);
			const greetingContract = Greeting__factory.connect(
				GREETING_CONTRACT_ADDRESS,
				provider
			);
			const result = await greetingContract.getGreeting();
			setMessage(result);
			showToast.success("Message fetched successfully");
		} catch (error) {
			console.error(error);
			showToast.error("Failed to get message");
		} finally {
			setIsLoading(false);
		}
	};

	const setGreeting = async () => {
		if (!inputRef.current?.value) {
			showToast.error("Please enter a greeting");
			return;
		}
		setIsLoading(true);

		try {
			showToast.loading("Creating Tx..");

			const greetingContract = Greeting__factory.connect(
				GREETING_CONTRACT_ADDRESS,
				provider
			);
			const contractSigner = greetingContract.connect(signer!);
			const tx = await contractSigner.setGreeting(inputRef.current.value);

			showToast.loading("Waiting for confirmation..");
			await tx.wait();

			await getMessage();
			showToast.success("Greeting set successfully!");
			inputRef.current.value = "";
		} catch (error) {
			console.error(error);
			showToast.error("Failed to set greeting");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='h-screen  py-12 px-4 sm:px-6 bg--background'>
			<div className='max-w-3xl mx-auto h-full'>
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className='flex items-center justify-between mb-16'>
					<ConnectKitButton />
					<motion.h1
						className='text-3xl font-bold text-gray-800 tracking-tight'
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 200 }}>
						<span className='text-blue-500'>Message</span> Dapp
					</motion.h1>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='px-6 py-2.5 bg-red-500/90 hover:bg-red-600 rounded-xl text-white 
							font-medium shadow-lg shadow-red-500/20 transition-colors duration-200'
						onClick={() => disconnect()}>
						Disconnect
					</motion.button>
				</motion.div>

				{/* Alert Message */}
				{account.address && (
					<Alert
						message={message}
						variant='success'
						isLoading={isLoading}
					/>
				)}

				{/* Alert Message */}
				{!account.address && (
					<Alert
						message='Connect wallet to see message'
						variant='error'
						isLoading={false}
					/>
				)}
				{/* Main Content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className='space-y-8 mt-10'>
					{/* Input Section */}
					<div className='relative'>
						<MessageSquare className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
						<input
							ref={inputRef}
							type='text'
							placeholder='Enter your greeting...'
							className='w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-200 
								text-gray-800 placeholder-gray-400
								focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
								transition-all duration-200
								text-lg shadow-lg shadow-gray-200/50'
						/>
					</div>
					{account.address && (
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className='text-gray-500 text-center'>
							Connected to {account.address}
						</motion.p>
					)}

					{/* Action Buttons */}
					<motion.div
						className='flex justify-center items-center gap-4'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-500 
								hover:bg-blue-600 rounded-xl text-white font-medium shadow-lg 
								shadow-blue-500/20 transition-colors duration-200 min-w-[160px]'
							onClick={getMessage}
							disabled={isLoading}>
							<RefreshCw
								className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
							/>
							Get Message
						</motion.button>

						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-800 
								hover:bg-gray-900 rounded-xl text-white font-medium shadow-lg 
								shadow-gray-800/20 transition-colors duration-200 min-w-[160px]'
							onClick={setGreeting}
							disabled={isLoading}>
							<Send className='h-5 w-5' />
							Set Message
						</motion.button>
					</motion.div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export default AppLayout;

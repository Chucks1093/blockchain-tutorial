import { useAccount, useDisconnect } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useRef, useState, useEffect } from "react";
import { SECRETMESSAGE_CONTRACT_ADDRESS } from "@/lib/constants";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { handleSecretMessageCustomContractError, showToast } from "@/lib/utils";
import { SecretMessage__factory } from "@/types/contracts";
import { Alert } from "@/components/Alert";
import { MessageForm } from "@/components/messaging/MessageForm";
import { MessageList } from "@/components/messaging/MessageList";
import { Send, RefreshCw, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

function SecretMessagePage() {
	const account = useAccount();
	const { disconnect } = useDisconnect();
	const provider = useEthersProvider();
	const signer = useEthersSigner();
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (provider) {
			getMessage();
		}
	}, [account.isConnected]);

	const getMessage = async () => {
		const contract = SecretMessage__factory.connect(
			SECRETMESSAGE_CONTRACT_ADDRESS,
			provider
		);
		try {
			setIsLoading(true);
			const result = await contract.getGeneralMessage();
			setMessage(result);
			showToast.success("Message fetched successfully");
		} catch (error) {
			console.error(error);
			console.error(error);
			const errorMessage = handleSecretMessageCustomContractError(
				error,
				contract
			);
			showToast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const setGeneralMessage = async () => {
		if (!inputRef.current?.value) {
			showToast.error("Please enter a message");
			return;
		}
		setIsLoading(true);
		const contract = SecretMessage__factory.connect(
			SECRETMESSAGE_CONTRACT_ADDRESS,
			provider
		);

		try {
			showToast.loading("Creating Tx...");
			const contractSigner = contract.connect(signer);
			const tx = await contractSigner.setGeneralMessage(
				inputRef.current.value
			);

			showToast.loading("Waiting for confirmation..");
			await tx.wait();
			await getMessage();

			showToast.success("General message updated successfully!");
			inputRef.current.value = "";
		} catch (error) {
			console.error(error);
			const errorMessage = handleSecretMessageCustomContractError(
				error,
				contract
			);
			showToast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

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
						Message Dapp
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

				{/* General Message Section */}
				{account.address && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className='bg-white p-6 rounded-2xl shadow-lg mb-8'>
						<h2 className='text-xl font-semibold text-gray-800 mb-4'>
							General Message
						</h2>

						{/* Current Message Display */}
						<div className='bg-gray-50 p-4 rounded-xl mb-4'>
							<p className='text-gray-700'>
								{message || "No message set"}
							</p>
						</div>

						{/* Message Input */}
						<div className='space-y-4'>
							<div className='relative'>
								<Edit2 className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
								<input
									ref={inputRef}
									type='text'
									placeholder='Enter new general message...'
									className='w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                    text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
								/>
							</div>

							<div className='flex gap-4'>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 
                    hover:bg-blue-600 rounded-xl text-white font-medium shadow-lg 
                    shadow-blue-500/20 transition-colors duration-200'
									onClick={setGeneralMessage}
									disabled={isLoading}>
									<Send className='h-5 w-5' />
									Update Message
								</motion.button>

								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className='flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 
                    hover:bg-gray-200 rounded-xl text-gray-700 font-medium 
                    transition-colors duration-200'
									onClick={getMessage}
									disabled={isLoading}>
									<RefreshCw
										className={`h-5 w-5 ${
											isLoading ? "animate-spin" : ""
										}`}
									/>
									Refresh
								</motion.button>
							</div>
						</div>
					</motion.div>
				)}

				{/* Alert Message */}
				{!account.address && (
					<Alert
						message='Connect wallet to send and receive messages'
						variant='error'
						isLoading={false}
					/>
				)}

				{/* Main Content */}
				{account.address && (
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						<MessageForm />
						<MessageList />
					</div>
				)}
			</div>
		</motion.div>
	);
}

export default SecretMessagePage;

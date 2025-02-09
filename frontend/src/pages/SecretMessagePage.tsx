import { useAccount, useDisconnect } from "wagmi";
import { useRef, useState, useEffect, Fragment } from "react";
import { SECRETMESSAGE_CONTRACT_ADDRESS } from "@/lib/constants";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { handleSecretMessageCustomContractError, showToast } from "@/lib/utils";
import { SecretMessage__factory } from "@/types/contracts/factories/SecretMessage__factory";
import { Alert } from "@/components/Alert";
import { MessageForm } from "@/components/messaging/MessageForm";
import { MessageList } from "@/components/messaging/MessageList";
import { Send, RefreshCw, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

import ProjectHeader from "@/components/common/ProjectHeader";

function SecretMessagePage() {
	const account = useAccount();
	const { disconnect } = useDisconnect();
	const provider = useEthersProvider();
	const signer = useEthersSigner();
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!provider) {
			showToast.error("Provider issues");
		}
		if (provider) {
			getMessage();
		}
	}, [account.isConnected]);

	const getMessage = async () => {
		const contract = await SecretMessage__factory.connect(
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
		<Fragment>
			<ProjectHeader
				connectButton='bg-white text-zinc-700 shadow-lg border border-gray-100'
				title='Simple Messaging'>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='px-6 py-2.5 bg-red-500/90 hover:bg-red-600 rounded-xl text-white 
                     font-medium shadow-lg shadow-red-500/20 transition-colors duration-200'
					onClick={() => disconnect()}>
					Disconnect
				</motion.button>
			</ProjectHeader>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='min-h-screen  	   py-12  bg-gray-100'>
				<div className=' mx-auto max-w-7xl px-4 md:px-8 '>
					{/* Header Section */}

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
						<div className='flex  flex-col lg:flex-row lg:justify-between gap-8'>
							<MessageForm />
							<MessageList />
						</div>
					)}
				</div>
			</motion.div>
		</Fragment>
	);
}

export default SecretMessagePage;

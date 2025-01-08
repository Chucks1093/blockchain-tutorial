import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { SecretMessage__factory } from "@/types/contracts";
import { SECRETMESSAGE_CONTRACT_ADDRESS } from "@/lib/constants";
import { shortenAddress, showToast } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { handleSecretMessageCustomContractError } from "@/lib/utils";

export function MessageForm() {
	const [isLoading, setIsLoading] = useState(false);
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const addressRef = useRef<HTMLInputElement>(null);
	const messageRef = useRef<HTMLInputElement>(null);

	const sendMessage = async () => {
		if (!addressRef.current?.value || !messageRef.current?.value) {
			showToast.error("Please enter both address and message");
			return;
		}

		setIsLoading(true);
		const contract = SecretMessage__factory.connect(
			SECRETMESSAGE_CONTRACT_ADDRESS,
			provider
		);
		try {
			showToast.loading("Sending message...");
			const contractSigner = contract.connect(signer);

			// Send the message
			const tx = await contractSigner.sendMessage(
				addressRef.current.value,
				messageRef.current.value
			);

			// Wait for transaction and listen for event
			await tx.wait();
		} catch (error) {
			const errorMessage = handleSecretMessageCustomContractError(
				error,
				contract
			);
			showToast.error(errorMessage);
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		const contract = SecretMessage__factory.connect(
			SECRETMESSAGE_CONTRACT_ADDRESS,
			provider
		);

		const messageSentEvent = contract.getEvent("MessageSent");

		const messageSentListener = (
			from: string,
			to: string,
			message: string
		) => {
			console.log({ from, to, message });
			console.log("from listener");
			showToast.success(`Message sent to ${shortenAddress(to)}`);
			messageRef.current!.value = "";
			addressRef.current!.value = "";
		};

		contract.on(messageSentEvent, messageSentListener);

		return () => {
			contract.off(messageSentEvent, messageSentListener);
		};
	}, [provider]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='bg-white p-6 rounded-2xl shadow-lg space-y-4'>
			<h2 className='text-xl font-semibold text-gray-800'>Send Message</h2>

			<div className='relative'>
				<MessageSquare className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
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
				<MessageSquare className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
				<input
					ref={messageRef}
					type='text'
					placeholder='Enter your message...'
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
				onClick={sendMessage}
				disabled={isLoading}>
				<Send className='h-5 w-5' />
				Send Message
			</motion.button>
		</motion.div>
	);
}

import { useState, useEffect } from "react";
import { SecretMessage__factory, SecretMessage } from "@/types/contracts";
import { SECRETMESSAGE_CONTRACT_ADDRESS } from "@/lib/constants";
import { showToast } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useAccount } from "wagmi";

export function MessageList() {
	const provider = useEthersProvider();
	const signer = useEthersSigner();
	const account = useAccount();
	const [sentMessages, setSentMessages] = useState<
		SecretMessage.MessageInfoStructOutput[]
	>([]);
	const [receivedMessages, setReceivedMessages] = useState<
		SecretMessage.MessageInfoStructOutput[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<"sent" | "received">("received");

	const fetchMessages = async () => {
		if (!provider || !signer) return;
		showToast.loading("Fetching messages");
		setIsLoading(true);
		try {
			const contract = SecretMessage__factory.connect(
				SECRETMESSAGE_CONTRACT_ADDRESS,
				provider
			);
			const contractSigner = contract.connect(signer);

			// Send the message
			const sent = await contractSigner.getSentMessages();

			const received = await contractSigner.getReceivedMessages();

			const allValues = received.length;
			console.log(allValues);
			console.log(sent);
			setSentMessages(sent);
			setReceivedMessages(received);
			showToast.success("Messages fetch successfully");
		} catch (error) {
			console.error(error);
			showToast.error("Failed to fetch messages");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (account) {
			fetchMessages();
		}
	}, [account, signer]);

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatTimestamp = (timestamp: bigint) => {
		return new Date(Number(timestamp) * 1000).toLocaleString();
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='w-full bg-white p-6 rounded-2xl shadow-lg'>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-800'>Messages</h2>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={fetchMessages}
					className='p-2 rounded-lg hover:bg-gray-100'>
					<RefreshCw
						className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
					/>
				</motion.button>
			</div>

			<div className='flex gap-4 mb-6'>
				<button
					className={`px-4 py-2 rounded-lg ${
						activeTab === "received"
							? "bg-blue-500 text-white"
							: "bg-gray-100 text-gray-600"
					}`}
					onClick={() => setActiveTab("received")}>
					Received
				</button>
				<button
					className={`px-4 py-2 rounded-lg ${
						activeTab === "sent"
							? "bg-blue-500 text-white"
							: "bg-gray-100 text-gray-600"
					}`}
					onClick={() => setActiveTab("sent")}>
					Sent
				</button>
			</div>

			<div className='space-y-4'>
				{activeTab === "sent" ? (
					sentMessages.length === 0 ? (
						<p className='text-gray-500 text-center py-4'>
							No sent messages
						</p>
					) : (
						sentMessages.map((msg, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className='p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors'>
								<p className='text-sm text-gray-500'>
									To: {formatAddress(msg.recipient)}
								</p>
								<p className='text-gray-800 mt-2'>{msg.content}</p>
								<div className='flex justify-between mt-2 text-sm text-gray-500'>
									<span>{formatTimestamp(msg.timestamp)}</span>
									{/* {msg.isRead && <span>Read ✓</span>} */}
								</div>
							</motion.div>
						))
					)
				) : receivedMessages.length === 0 ? (
					<p className='text-gray-500 text-center py-4'>
						No received messages
					</p>
				) : (
					receivedMessages.map((msg, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className='p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors'>
							<p className='text-sm text-gray-500'>
								From: {formatAddress(msg.recipient)}
							</p>
							<p className='text-gray-800 mt-2'>{msg.content}</p>
							<p className='text-sm text-gray-500 mt-2'>
								{formatTimestamp(msg.timestamp)}
							</p>
						</motion.div>
					))
				)}
			</div>
		</motion.div>
	);
}

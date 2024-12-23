import { shortenAddress } from "@/lib/utils";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

function ConnectButton() {
	const { address } = useAccount();
	const { connect } = useConnect();
	const { disconnect } = useDisconnect();

	return address ? (
		<button
			onClick={() => disconnect()}
			className='bg-blue-600 text-white text-sm px-8 py-3 rounded-[.8rem] shadow-lg shadow-blue-500'>
			{shortenAddress(address!)}
		</button>
	) : (
		<button
			className='bg-blue-600 text-white text-sm px-8 py-3 rounded-[.8rem] shadow-lg shadow-blue-500'
			onClick={() => connect({ connector: injected() })}>
			Connect Wallet
		</button>
	);
}
export default ConnectButton;

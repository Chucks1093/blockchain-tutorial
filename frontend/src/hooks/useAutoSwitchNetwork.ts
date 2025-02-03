import { useSwitchChain, useAccount } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useEffect } from "react";
import { useEthersProvider } from "./useEthersProvider";

export function useAutoSwitchNetwork() {
	const { isConnected } = useAccount();
	const { switchChain } = useSwitchChain();
	const provider = useEthersProvider();

	useEffect(() => {
		if (isConnected) {
			switchChain?.({
				chainId: baseSepolia.id,
			});
		}
	}, [isConnected, switchChain, provider]);
}

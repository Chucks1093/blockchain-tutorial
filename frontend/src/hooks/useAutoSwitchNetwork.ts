import { useSwitchChain, useAccount } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useEffect } from "react";

export function useAutoSwitchNetwork() {
	const { isConnected } = useAccount();
	const { switchChain } = useSwitchChain();

	useEffect(() => {
		if (isConnected) {
			switchChain?.({
				chainId: baseSepolia.id,
			});
		}
	}, [isConnected, switchChain]);
}

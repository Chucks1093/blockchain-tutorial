import { JsonRpcProvider, FallbackProvider, JsonRpcSigner } from "ethers";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useMemo } from "react";
export type ContractProvider = JsonRpcProvider | FallbackProvider | undefined;

export type ContractSigner = JsonRpcSigner | undefined;

type ContractServiceConstructor<T> = new (
	provider: ContractProvider,
	signer: ContractSigner
) => T;

export const useContractService = <T extends object>(
	ContractService: ContractServiceConstructor<T>
) => {
	const signer = useEthersSigner();
	const provider = useEthersProvider();

	// Return memoized service instance directly
	return useMemo(() => {
		if (!provider) throw new Error("No provider available");
		return new ContractService(provider, signer);
	}, [provider, signer, ContractService]);
};

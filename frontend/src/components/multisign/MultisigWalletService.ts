import { MultiSignatureWallet__factory } from "@/types/contracts/factories/MultiSignatureWallet__factory";
import { MultiSignatureWallet } from "@/types/contracts/MultiSignatureWallet";
import { MULTISIGN_CONTRACT_ADDRESS } from "@/lib/constants";
import {
	ContractProvider,
	ContractSigner,
} from "../shared/BaseContractService";
import { useState } from "react";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { ethers } from "ethers";

type Transaction = MultiSignatureWallet.TransactionStruct;
type ContractServiceConstructor<T> = new (
	provider: ContractProvider,
	signer: ContractSigner
) => T;

// 2. Update the hook to be generic
export const useContractService = <T extends object>(
	ContractService: ContractServiceConstructor<T>
) => {
	const signer = useEthersSigner();
	const provider = useEthersProvider();
	const [contractService] = useState(
		() => new ContractService(provider, signer)
	);

	return contractService;
};

export class MuliSigWalletService {
	private contract: MultiSignatureWallet;
	private signer: MultiSignatureWallet;

	constructor(provider: ContractProvider, signer: ContractSigner) {
		this.contract = MultiSignatureWallet__factory.connect(
			MULTISIGN_CONTRACT_ADDRESS,
			provider
		);
		this.signer = this.contract.connect(signer);
	}

	async getOwners() {
		return await this.contract.getOwners();
	}

	async addNewOwner(newOwner: ethers.AddressLike) {
		return await this.contract.addNewOwner(newOwner);
	}

	async getRequiredSignatures(): Promise<number> {
		return 2;
	}

	async getBalance() {
		return await this.contract.getBalace();
	}

	async submitTransaction(
		to: ethers.AddressLike,
		amount: ethers.BigNumberish,
		data: ethers.BytesLike
	) {
		return await this.signer.submitTransaction(to, amount, data);
	}

	async confirmTransaction(tx: Transaction) {
		return await this.signer.confirmTransaction(tx.txIndex, tx.from);
	}

	async getAllTransactions() {
		return await this.contract.getUserTransactions();
	}
}

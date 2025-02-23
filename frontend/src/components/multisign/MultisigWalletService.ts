import { MultiSignatureWallet__factory } from "@/types/contracts/factories/MultiSignatureWallet__factory";
import { MultiSignatureWallet } from "@/types/contracts/MultiSignatureWallet";
import { MULTISIGN_CONTRACT_ADDRESS } from "@/lib/constants";
import {
	ContractProvider,
	ContractSigner,
} from "../shared/BaseContractService";
import { useEffect, useState } from "react";
import { useContractService } from "../shared/BaseContractService";
import { ethers, formatEther } from "ethers";
import { showToast } from "@/lib/utils";
import { useRef } from "react";
import { parseEther, toUtf8Bytes } from "ethers";

export type Transaction = MultiSignatureWallet.TransactionStructOutput;

export const useMultiSigWallet = () => {
	const [walletBalance, setWalletBalance] = useState<string | null>(null);
	const [requiredSignatures, setRequiredSignatures] = useState<number>(0);
	const [owners, setOwners] = useState<string[]>([]);
	const contractService = useContractService(MuliSigWalletService);
	const [loading, setIsLoading] = useState(false);
	const [admin, setAdmin] = useState("");

	const [transactions, setTransactions] = useState<Transaction[]>([]);

	// Additional refs for new features
	const addressRef = useRef<HTMLInputElement>(null);
	const amountRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);
	const newSignaturesRef = useRef<HTMLInputElement>(null);
	const newOwnerRef = useRef<HTMLInputElement>(null);
	const ownerRoleRef = useRef<HTMLSelectElement>(null);

	const changeRequiredSignatures = async () => {
		try {
			if (newSignaturesRef?.current?.value == "1") {
				return showToast.error("Signatures must be greater than one");
			}
		} catch (error) {
			console.error(error);
			showToast.error("Failed to change signature");
		}
	};

	const submitTransaction = async () => {
		if (
			!addressRef.current?.value ||
			!amountRef.current?.value ||
			!descriptionRef.current?.value
		) {
			// Show error toast
			return showToast.error("Fill all input");
		}

		showToast.loading("Submitting Transaction");

		setIsLoading(true);
		try {
			const tx = await contractService.submitTransaction(
				addressRef.current.value,
				amountRef.current.value,
				descriptionRef.current?.value || ""
			);
			await tx.wait();
		} catch (error) {
			showToast.error("Transaction submission failed");
			console.error("Transaction submission failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const addNewOwner = async () => {
		if (!newOwnerRef.current?.value)
			return showToast.error("Input an address");

		setIsLoading(true);
		try {
			const newOwner = newOwnerRef.current.value;
			await contractService.addNewOwner(newOwner);
			setOwners((values) => [...values, newOwner]);
			newOwnerRef.current.value = "";
		} catch (error) {
			showToast.error("Failed to add owner");
			console.error("Failed to add owner:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getWalletOwners = async () => {
		try {
			const owners = await contractService.getOwners();
			setOwners([...owners]);
		} catch (error) {
			console.error(error);
		}
	};
	const getRequiredSignatures = async () => {
		try {
			const signatures = await contractService.getRequiredSignatures();
			setRequiredSignatures(Number(signatures));
		} catch (error) {
			console.error(error);
		}
	};

	const getWalletBalance = async () => {
		try {
			const balance = await contractService.getBalance();
			setWalletBalance(`${formatEther(balance)} ETH`);
		} catch (error) {
			console.error(error);
		}
	};

	const getCurrentAdminDetails = async () => {
		try {
			const admin = await contractService.getCurrentAdminDetails();
			setAdmin(admin);
		} catch (error) {
			console.error(error);
		}
	};

	const getAllTransactions = async () => {
		try {
			const transactions = await contractService.getAllTransactions();
			console.log(transactions);
			setTransactions([...transactions]);
			return transactions;
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (contractService.signer) {
			getWalletBalance();
			getAllTransactions();
			getRequiredSignatures();
			getWalletOwners();
		}
	}, [contractService.signer]);

	useEffect(() => {
		if (!contractService.signer) return;
		const transactionSubmittedEvent = contractService.contract.getEvent(
			"TransactionSubmitted"
		);

		const transactionSubmittedListener = async (
			txIndex: bigint,
			from: string
		) => {
			const newTransaction = await contractService.getTransactionDetails(
				Number(txIndex),
				from
			);
			console.log(newTransaction);
			setTransactions((prev) => [...prev, newTransaction]);

			// Reset form
			addressRef.current!.value = "";
			amountRef.current!.value = "";

			showToast.success("Transaction submitted for confirmation");
		};

		contractService.contract.on(
			transactionSubmittedEvent,
			transactionSubmittedListener
		);

		return () => {
			contractService.contract.off(
				transactionSubmittedEvent,
				transactionSubmittedListener
			);
		};
	}, [contractService.signer]);

	return {
		owners,
		requiredSignatures,
		walletBalance,
		addNewOwner,
		submitTransaction,
		changeRequiredSignatures,
		loading,
		getCurrentAdminDetails,
		ownerRoleRef,
		admin,
		contractService,
		transactions,
		addressRef,
		descriptionRef,
		amountRef,
		newOwnerRef,
	};
};

export class MuliSigWalletService {
	public contract: MultiSignatureWallet;
	public signer: MultiSignatureWallet;

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
	async getCurrentAdminDetails() {
		return await this.contract.getCurrentAdminDetails();
	}

	async addNewOwner(newOwner: ethers.AddressLike) {
		if (this.signer) return await this.signer.addNewOwner(newOwner);
	}

	async getRequiredSignatures(): Promise<bigint> {
		return this.contract.getRequiredSignatures();
	}

	async getBalance() {
		return await this.contract.getBalace();
	}

	async submitTransaction(
		to: ethers.AddressLike,
		amount: string,
		data: string
	) {
		return await this.signer.submitTransaction(
			to,
			parseEther(amount),
			toUtf8Bytes(data)
		);
	}
	async changeCurrentAdmin(address: string) {
		return await this.signer.proposeNewAdmin(address);
	}

	async changeRequiredTransaction(signature: number) {
		return await this.signer.changeRequiredSignatures(signature);
	}

	async confirmTransaction(txIndex: number, from: string) {
		return await this.signer.confirmTransaction(txIndex, from);
	}

	async revokeTransaction(txIndex: number, from: string) {
		return await this.signer.revokeTransaction(txIndex, from);
	}

	async getAllTransactions() {
		return await this.signer.getUserTransactions();
	}

	async getTransactionDetails(txIndex: number, from: string) {
		return await this.signer.getTransationDetails(txIndex, from);
	}
}

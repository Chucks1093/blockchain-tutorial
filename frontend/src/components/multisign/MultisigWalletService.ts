import { ethers } from "ethers";
import { MultisigWallet__factory } from "@/types/contracts";

export class MultisigWalletService {
	private contract: ethers.Contract;

	constructor(
		private address: string,
		private provider: ethers.providers.Provider,
		private signer?: ethers.Signer
	) {
		this.contract = MultisigWallet__factory.connect(address, provider);
	}

	async getOwners() {
		return await this.contract.getOwners();
	}

	async getRequiredSignatures() {
		return await this.contract.requiredSignatures();
	}

	async getBalance() {
		return ethers.utils.formatEther(
			await this.provider.getBalance(this.address)
		);
	}

	async submitTransaction(to: string, amount: string) {
		if (!this.signer) throw new Error("Signer required");
		const contractWithSigner = this.contract.connect(this.signer);
		const value = ethers.utils.parseEther(amount);
		return await contractWithSigner.submitTransaction(to, value);
	}

	async approveTransaction(txIndex: number) {
		if (!this.signer) throw new Error("Signer required");
		const contractWithSigner = this.contract.connect(this.signer);
		return await contractWithSigner.approveTransaction(txIndex);
	}

	async executeTransaction(txIndex: number) {
		if (!this.signer) throw new Error("Signer required");
		const contractWithSigner = this.contract.connect(this.signer);
		return await contractWithSigner.executeTransaction(txIndex);
	}

	async getPendingTransactions() {
		const txCount = await this.contract.getTransactionCount();
		const transactions = [];

		for (let i = 0; i < txCount; i++) {
			const tx = await this.contract.getTransaction(i);
			if (!tx.executed) {
				const approvals = await this.contract.getApprovalCount(i);
				transactions.push({
					index: i,
					to: tx.to,
					amount: ethers.utils.formatEther(tx.value),
					executed: tx.executed,
					approvals,
				});
			}
		}

		return transactions;
	}

	async changeRequiredSignatures(newRequired: number) {
		if (!this.signer) throw new Error("Signer required");
		const contractWithSigner = this.contract.connect(this.signer);
		return await contractWithSigner.changeRequiredSignatures(newRequired);
	}
}

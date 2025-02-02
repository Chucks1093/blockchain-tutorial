import { JsonRpcProvider, FallbackProvider, JsonRpcSigner } from "ethers";

export type ContractProvider = JsonRpcProvider | FallbackProvider | undefined;

export type ContractSigner = JsonRpcSigner | undefined;

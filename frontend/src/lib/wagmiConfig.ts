import { http, createConfig } from "wagmi";
import { anvil, baseSepolia } from "wagmi/chains";

import { WAGMI_PROJECT_ID } from "./constants";
import { getDefaultConfig } from "connectkit";

const chains = [anvil, baseSepolia] as const;

export const wagmiConfig = createConfig(
	getDefaultConfig({
		chains,
		transports: {
			[anvil.id]: http(anvil.rpcUrls.default.http[0]), // or your own RPC url
			[baseSepolia.id]: http("https://sepolia.base.org"),
		},
		// Required API Keys
		walletConnectProjectId: WAGMI_PROJECT_ID,

		// Required App Info
		appName: "Blockchain Projects",

		// Optional App Info
		appDescription: "This is the blockchain projects.",
	})
);

declare module "wagmi" {
	interface Register {
		config: typeof wagmiConfig;
	}
}

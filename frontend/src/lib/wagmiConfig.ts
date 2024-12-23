import { http, createConfig } from "wagmi";
import { anvil } from "wagmi/chains";

import { WAGMI_PROJECT_ID } from "./constants";
import { getDefaultConfig } from "connectkit";

const chains = [anvil] as const;
export const wagmiConfig = createConfig(
	getDefaultConfig({
		chains,
		transports: {
			[anvil.id]: http(anvil.rpcUrls.default.http[0]), // or your own RPC url
		},
		// Required API Keys
		walletConnectProjectId: WAGMI_PROJECT_ID,

		// Required App Info
		appName: "Your App Name",

		// Optional App Info
		appDescription: "Your App Description",
	})
);

declare module "wagmi" {
	interface Register {
		config: typeof wagmiConfig;
	}
}

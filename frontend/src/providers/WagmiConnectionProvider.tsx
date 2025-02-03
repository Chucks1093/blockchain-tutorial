import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { ConnectKitProvider } from "connectkit";
import NetworkSwitcher from "./NetworkSwitcher";
import makeBlockie from "ethereum-blockies-base64";

const queryClient = new QueryClient();

function WagmiConnectionProvider({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider
					options={{
						customAvatar: ({ address, size }) => (
							<img
								src={makeBlockie(address || "")}
								width={size}
								height={size}
								className='rounded-full'
								alt='avatar'
							/>
						),
					}}>
					<NetworkSwitcher>{children}</NetworkSwitcher>
				</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
export default WagmiConnectionProvider;

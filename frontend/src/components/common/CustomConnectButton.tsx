import { ConnectKitButton } from "connectkit";
import makeBlockie from "ethereum-blockies-base64";

const CustomConnectButton = () => (
	<ConnectKitButton.Custom>
		{({ isConnected, show, address }) => {
			return (
				<button
					onClick={show}
					className='flex items-center gap-2 px-4 py-2 text-[.8rem] md:text-[1rem] 
                     bg-app-offwhite text-app-primary rounded-[.5rem] md:rounded-[.7rem] 
                     hover:bg-blue-700 hover:text-white transition-colors shadow-lg'>
					{isConnected ? (
						<>
							<img
								src={makeBlockie(address || "")}
								className='w-5 h-5 rounded-full'
								alt='avatar'
							/>
							<span>
								{address?.slice(0, 6)}...{address?.slice(-4)}
							</span>
						</>
					) : (
						"Connect Wallet"
					)}
				</button>
			);
		}}
	</ConnectKitButton.Custom>
);
export default CustomConnectButton;

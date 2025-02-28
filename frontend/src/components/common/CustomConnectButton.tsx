import { cn } from "@/lib/utils";
import { ConnectKitButton } from "connectkit";
import makeBlockie from "ethereum-blockies-base64";

type ButtonProps = {
	className?: string;
};
const CustomConnectButton = (props: ButtonProps) => (
	<ConnectKitButton.Custom>
		{({ isConnected, show, address }) => {
			const handleClick = () => {
				show?.();
			};
			return (
				<button
					onClick={handleClick}
					className={cn(
						"flex items-center gap-2 px-4 py-2 text-[.8rem] md:text-[1rem] rounded-[.5rem] md:rounded-[.7rem] hover:bg-zinc-50 hover:text-zinc-600 transition-colors shadow-md bg-white text-app-primary",
						props.className
					)}>
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

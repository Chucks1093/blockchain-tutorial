import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import AppLayout from "./pages/AppLayout";
import { Toaster } from "react-hot-toast";
import WagmiConnectionProvider from "./providers/WagmiConnectionProvider";
import MultiSignatureWallet from "./pages/MultiSignatureWallet";
import SecretMessagePage from "./pages/SecretMessagePage";
import TokenVesting from "./pages/TokenVesting";

const router = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
	},
	{
		path: "/messaging",
		element: <SecretMessagePage />,
	},
	{
		path: "/multisign",
		element: <MultiSignatureWallet />,
	},
	{
		path: "/vesting",
		element: <TokenVesting />,
	},
]);

function App() {
	return (
		<WagmiConnectionProvider>
			<Toaster position='bottom-right' />
			<RouterProvider router={router} />
		</WagmiConnectionProvider>
	);
}

export default App;

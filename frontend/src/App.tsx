import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import AppLayout from "./pages/AppLayout";
import { Toaster } from "react-hot-toast";
import WagmiConnectionProvider from "./providers/WagmiConnectionProvider";
import MultiSignatureWallet from "./pages/MultiSignatureWallet";
import SecretMessagePage from "./pages/SecretMessagePage";
import TokenVesting from "./pages/TokenVesting";
import LocalAutomator from "./pages/LocalAutomator";
import Footer from "./components/shared/Footer";

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
	{
		path: "/automator/*",
		element: <LocalAutomator />,
	},
]);

function App() {
	return (
		<WagmiConnectionProvider>
			<Toaster position='bottom-right' />
			<RouterProvider router={router} />
			<Footer />
		</WagmiConnectionProvider>
	);
}

export default App;

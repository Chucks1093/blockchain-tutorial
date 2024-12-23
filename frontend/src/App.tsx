import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import AppLayout from "./pages/AppLayout";
import { Toaster } from "react-hot-toast";
import WagmiConnectionProvider from "./providers/WagmiConnectionProvider";

const router = createBrowserRouter([
	{
		path: "/",
		element: <AppLayout />,
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

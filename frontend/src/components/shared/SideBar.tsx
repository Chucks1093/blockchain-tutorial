import { NavLink } from "react-router";
import { MessageSquare, CheckSquare, Wallet } from "lucide-react";

function SideBar() {
	const navItems = [
		{
			name: "Greeting",
			path: "/greeting",
			icon: <MessageSquare className='w-5 h-5' />,
		},
		{
			name: "Simple Tasks",
			path: "/tasks",
			icon: <CheckSquare className='w-5 h-5' />,
		},
		{
			name: "Token",
			path: "/token",
			icon: <Wallet className='w-5 h-5' />,
		},
	];

	return (
		<div className='h-screen w-64 bg-gray-900 text-white p-4'>
			<div className='text-xl font-bold mb-8 pl-4'>Blockchain Tutorial</div>
			<nav>
				{navItems.map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						className={({ isActive }) =>
							`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
								isActive
									? "bg-blue-600 text-white"
									: "text-gray-300 hover:bg-gray-800"
							}`
						}>
						{item.icon}
						<span>{item.name}</span>
					</NavLink>
				))}
			</nav>
		</div>
	);
}

export default SideBar;

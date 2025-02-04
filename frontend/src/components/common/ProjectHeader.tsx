import CustomConnectButton from "./CustomConnectButton";
import { motion } from "framer-motion";

type HeaderProps = {
	connectButton?: string;
	children: React.ReactNode;
	title: string;
};

function ProjectHeader({ children, connectButton, title }: HeaderProps) {
	return (
		<header className=' border-b border-gray-200 '>
			<div className='max-w-7xl mx-auto  flex justify-between items-center h-[9vh] relative px-4 md:px-8 '>
				<div className='flex items-center gap-2 z-30'>
					<CustomConnectButton className={connectButton} />
				</div>
				<div>
					<motion.h1
						className='text-2xl font-semibold text-zinc-600 tracking-tight absolute  inset-0 w-full flex items-center justify-center h-full capitalize font-manrope '
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 200 }}>
						{title}
					</motion.h1>
				</div>
				<div className='flex items-center gap-4 z-30'>{children}</div>
			</div>
		</header>
	);
}
export default ProjectHeader;

//  <div className='flex items-center gap-4'>
// 		<Button
// 			variant='outline'
// 			className='gap-2'>
// 			<RefreshCw className='h-4 w-4' />
// 			Sync
// 		</Button>
// 		<Button
// 			onClick={() => setShowCreateModal(true)}
// 			className='gap-2 bg-blue-500 hover:bg-blue-600'>
// 			<Plus className='h-4 w-4' />
// 			New Schedule
// 		</Button>
// 	</div>;

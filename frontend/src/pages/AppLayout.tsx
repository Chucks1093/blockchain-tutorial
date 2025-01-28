import { useState } from "react";
import { motion } from "framer-motion";
import {
	ExternalLink,
	Code,
	Box,
	Shield,
	BoxIcon,
	GitBranchPlus,
	Wallet,
} from "lucide-react";

const AppLayout = () => {
	const [activeFilter, setActiveFilter] = useState("all");

	const projects = [
		{
			title: "Multi-Signature Wallet",
			description:
				"A secure wallet requiring multiple signatures for transaction approval",
			category: "DeFi",
			stack: ["Solidity", "Hardhat", "React"],
			metrics: { contracts: 3, tests: 45, complexity: "High" },
			demoUrl: "#",
			githubUrl: "#",
			icon: <Wallet className='h-6 w-6' />,
		},
		{
			title: "NFT Marketplace",
			description:
				"Trade and auction unique digital assets with royalty support",
			category: "NFT",
			stack: ["Solidity", "IPFS", "NextJS"],
			metrics: { contracts: 4, tests: 52, complexity: "Medium" },
			demoUrl: "/multisign",
			githubUrl: "#",
			icon: <Box className='h-6 w-6' />,
		},
		{
			title: "DEX Protocol",
			description: "Decentralized exchange with automated market making",
			category: "DeFi",
			stack: ["Solidity", "Foundry", "TypeScript"],
			metrics: { contracts: 5, tests: 78, complexity: "High" },
			demoUrl: "#",
			githubUrl: "#",
			icon: <BoxIcon className='h-6 w-6' />,
		},
	];

	return (
		<div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100   pb-10'>
			<div className=' mx-auto '>
				{/* Header Section */}
				<div className='relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 mb-8'>
					<div className='relative pt-24 pb-32 px-4 sm:px-6 max-w-6xl mx-auto'>
						<nav className='max-w-6xl mx-auto flex justify-between items-center mb-20'>
							<div className='text-2xl font-semibold'>Portfolio</div>
							<div className='flex items-center gap-8'>
								<a
									href='#'
									className='text-gray-600 hover:text-gray-900'>
									Projects
								</a>
								<a
									href='#'
									className='text-gray-600 hover:text-gray-900'>
									About
								</a>
								<a
									href='#'
									className='text-gray-600 hover:text-gray-900'>
									Contact
								</a>
								<a
									href='#'
									className='px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors'>
									Get in touch
								</a>
							</div>
						</nav>

						<section className='max-w-6xl mx-auto'>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className='max-w-3xl'>
								<span className='inline-block px-4 py-1 bg-white/50 backdrop-blur-sm rounded-full text-sm text-gray-600 mb-6'>
									Blockchain Developer
								</span>
								<h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
									Building the future
									<br />
									with Web3 technology.
								</h1>
								<p className='text-xl text-gray-600 mb-8 leading-relaxed'>
									A collection of decentralized applications showcasing
									innovative solutions in DeFi, NFTs, and blockchain
									infrastructure.
								</p>
								<div className='flex items-center gap-4'>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className='px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors'>
										View Projects
									</motion.button>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className='px-8 py-3 bg-white text-gray-900 rounded-full hover:bg-gray-50 transition-colors'>
										Contact Me
									</motion.button>
								</div>
							</motion.div>
						</section>
					</div>
				</div>

				{/* Filters */}
				<div className='flex justify-center gap-4 mb-12'>
					{["all", "DeFi", "NFT", "DAO"].map((filter) => (
						<motion.button
							key={filter}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setActiveFilter(filter)}
							className={`px-6 py-2 rounded-full ${
								activeFilter === filter
									? "bg-gray-900 text-white"
									: "bg-white text-gray-600 hover:bg-gray-50"
							} shadow-sm transition-all duration-200`}>
							{filter.charAt(0).toUpperCase() + filter.slice(1)}
						</motion.button>
					))}
				</div>

				{/* Projects Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto '>
					{projects
						.filter(
							(project) =>
								activeFilter === "all" ||
								project.category === activeFilter
						)
						.map((project, index) => (
							<motion.div
								key={project.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
								{/* Project Header */}
								<div className='p-6 border-b border-gray-100'>
									<div className='flex items-center justify-between mb-4'>
										<div className='p-3 bg-gray-100 rounded-lg'>
											{project.icon}
										</div>
										<span className='px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600'>
											{project.category}
										</span>
									</div>
									<h3 className='text-xl font-semibold text-gray-900 mb-2'>
										{project.title}
									</h3>
									<p className='text-gray-600'>
										{project.description}
									</p>
								</div>

								{/* Project Details */}
								<div className='px-6 py-4 bg-gray-50'>
									<div className='flex flex-wrap gap-2 mb-4'>
										{project.stack.map((tech) => (
											<span
												key={tech}
												className='px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600'>
												{tech}
											</span>
										))}
									</div>

									<div className='flex justify-between items-center'>
										<div className='flex gap-2'>
											<motion.a
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												href={project.githubUrl}
												className='p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'>
												<GitBranchPlus className='h-5 w-5' />
											</motion.a>
											<motion.a
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												href={project.demoUrl}
												className='p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'>
												<ExternalLink className='h-5 w-5' />
											</motion.a>
										</div>
										<div className='flex items-center gap-4'>
											<span className='flex items-center gap-1 text-sm text-gray-500'>
												<Code className='h-4 w-4' />
												{project.metrics.contracts}
											</span>
											<span className='flex items-center gap-1 text-sm text-gray-500'>
												<Shield className='h-4 w-4' />
												{project.metrics.tests}
											</span>
										</div>
									</div>
								</div>
							</motion.div>
						))}
				</div>
			</div>
		</div>
	);
};

export default AppLayout;

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Shield, HardHat } from "lucide-react";
import { ArrowRight, BookOpen } from "lucide-react";
import { projects } from "@/data/projects";
import CustomConnectButton from "@/components/common/CustomConnectButton";

const Footer = () => {
	return (
		<footer className='flex text-white noicy bg-app-primary items-center justify-center '>
			<div className='flex justify-between items-center py-8 w-full max-w-6xl px-4 md:px-6 '>
				<p className='flex text-sm'>
					Built with{" "}
					<img
						className='w-5  mx-1'
						src='/icons/love.svg'
						alt=''
					/>{" "}
					for Base
				</p>
				<p>Based Projects!</p>
			</div>
		</footer>
	);
};

const AppLayout = () => {
	const [activeFilter, setActiveFilter] = useState("all");

	// from-blue-50 via-blue-100/50 to-white

	return (
		<Fragment>
			<div className='min-h-screen .bg-gradient-to-b from-blue-50 to-white pb-10 '>
				<div className='mx-auto'>
					{/* Header Section */}
					<header className='noicy relative overflow-hidden h-[75vh] md:h-[90vh] .bg-gradient-to-br   mb-8 '>
						<img
							className='w-[18rem] absolute md:-bottom-20 -bottom-[10rem] right-[10%] .rotate-45 '
							src='/icons/spark.svg'
							alt=''
						/>
						<div className='relative  px-4 sm:px-6 max-w-6xl mx-auto  flex md:items-center justify-start  h-full '>
							<nav className='absolute  w-full top-5 lg:top-[5rem] max-w-6xl mx-auto flex justify-between items-center  left-1/2 -translate-x-1/2 px-4 sm:px-6'>
								<a
									href='https://www.base.org/name/sebastian%F0%9F%8C%9F'
									className='md:text-xl text-sm  text-gray-200 flex items-center font-bold md:font-normal'>
									<span className='hidden md:block'>Sebastian</span>
									<img
										src='/icons/ens-star.svg'
										alt=''
										className='md:w-5  w-[1.8rem]'
									/>
									<span className='hidden md:block'>.eth</span>
								</a>
								<div className='flex items-center gap-8'>
									<a
										href='#'
										className='text-app-offwhite
										 hover:text-white md:block hidden'>
										About Me
									</a>
									<CustomConnectButton />
								</div>
							</nav>

							<section className='max-w-6xl mt-[8rem] md:mt-0  '>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className='max-w-3xl'>
									{/* <span className=' px-4 py-1 bg-blue-100 backdrop-blur-sm rounded-full text-sm text-blue-800 mb-6 flex justify-center items-center w-fit gap-1'>
										<img
											src='/icons/base.svg'
											alt=''
											className='w-5'
										/>
										Learning Solidity
									</span> */}
									<img
										src='/icons/wavy-line.svg'
										alt=''
										className=' w-[7rem] md:w-[10rem] mb-4'
									/>
									<h1 className='text-[2rem] md:text-7xl leading-8 md:leading-12 font-medium mb-6  font-marlin text-app-offwhite '>
										Learning & Building
										<br className='md:block hidden' />
										<span className='block mt-2 '>
											on Base Network
										</span>
									</h1>
									<p className='text-sm md:text-lg mb-8 leading-relaxed text-app-offwhite '>
										Exploring Solidity development through hands-on
										projects: from smart contract development to
										full-stack dApps on Base Sepolia. Join me on this
										learning journey into Web3.
									</p>
									<div className='flex items-center gap-4'>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className='px-5 md:px-8 py-2 md:py-3 bg-white text-zinc-700 rounded-full transition-colors flex items-center gap-2 shadow-lg  text-[.8rem] md:text-[1rem] '>
											View Projects
											<ArrowRight className='h-5 w-5' />
										</motion.button>
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className='px-5 md:px-8 py-2 md:py-3  border-[.1rem] border-zinc-200 bg-transparent  rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2 text-zinc-200 text-[.8rem] md:text-[1rem] '>
											Learn More
											<BookOpen
												className='h-5 w-5 '
												color='white'
											/>
										</motion.button>
									</div>
								</motion.div>
							</section>
						</div>
					</header>

					<h1 className='text-center font-marlin text-3xl font-semibold text-zinc-700 mb-5 block md:hidden'>
						Projects
					</h1>

					{/* Filters */}
					<div className=' justify-center gap-4 mb-12 flex-wrap hidden md:flex'>
						{[
							"all",
							"DeFi",
							"NFT",
							"DAO",
							"Gaming",
							"Security",
							"Tools",
							"Social",
						].map((filter) => (
							<motion.button
								key={filter}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setActiveFilter(filter)}
								className={`px-6 py-2 rounded-full ${
									activeFilter === filter
										? "bg-blue-600 text-white"
										: "bg-white text-blue-800 hover:bg-blue-50"
								} shadow-sm transition-all duration-200`}>
								{filter.charAt(0).toUpperCase() + filter.slice(1)}
							</motion.button>
						))}
					</div>

					{/* Projects Grid */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-5 md:px-0'>
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
									className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-zinc-100 hover:border-blue-200 group'>
									{/* Project Header */}
									<div className='p-8'>
										<div className='flex items-center justify-between mb-6'>
											<div className='p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl transition-colors'>
												{project.icon}
											</div>
											<span className='px-4 py-1.5 bg-zinc-100 rounded-full text-sm font-medium text-zinc-700'>
												{project.category}
											</span>
										</div>
										<h3 className='text-xl font-semibold font-marlin text-zinc-600 mb-3 group-hover:text-blue-600 transition-colors'>
											{project.title}
										</h3>
										<p className='text-zinc-500 leading-relaxed md:text-[1rem] text-sm'>
											{project.description}
										</p>
									</div>

									{/* Project Details */}
									<div className='px-8 py-6 bg-zinc-50 border-t border-zinc-100'>
										<div className='flex flex-wrap gap-2 mb-6'>
											{project.stack.map((tech) => (
												<span
													key={tech}
													className='px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-[.78rem] md:text-sm font-medium text-zinc-600'>
													{tech}
												</span>
											))}
										</div>

										<div className='flex justify-between items-center'>
											<div className='flex gap-3'>
												<motion.a
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													href={project.githubUrl}
													className='p-2.5 bg-white border border-zinc-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all'>
													<HardHat className='h-5 w-5 text-zinc-600 hover:text-blue-600' />
												</motion.a>
												<motion.a
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													href={project.demoUrl}
													className='p-2.5 bg-white border border-zinc-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all'>
													<ExternalLink className='h-5 w-5 text-zinc-600 hover:text-blue-600' />
												</motion.a>
											</div>
											<div className='flex items-center gap-6'>
												<span className='flex items-center gap-1 text-sm text-zinc-600'>
													<Shield className='h-4 w-4' />
													<span className='font-medium'>
														{project.metrics.tests}
													</span>{" "}
													Tests
												</span>
											</div>
										</div>
									</div>
								</motion.div>
							))}
					</div>
				</div>
			</div>
			<Footer />
		</Fragment>
	);
};

export default AppLayout;

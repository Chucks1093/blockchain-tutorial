import { useState, Fragment } from "react";
import { motion } from "framer-motion";
import { Settings,  Download, BarChart2, Filter } from "lucide-react";
import ProjectHeader from "@/components/common/ProjectHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpkeepTable from "@/components/local-automator/UpKeepCard";
import HistoryTable from "@/components/local-automator/HistoryCard";
import HistoryDetail from "@/components/local-automator/HistoryDetail";
import HistoryCardGrid from "@/components/local-automator/HistoryCardGrid";
import { Route, Routes } from "react-router";
import UpKeepDetails from "@/components/local-automator/UpKeepDetails";
import NewTask from "@/components/local-automator/NewTask";

// History home component
const HistoryHome = () => {
	const [activeView, setActiveView] = useState<"table" | "grid">("table");

	return (
		<Fragment>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}>
					<div className='flex justify-between items-center mb-6'>
						<h1 className='text-3xl font-medium font-manrope'>
							Transaction History
						</h1>
						<div className='flex items-center gap-3'>
							<div className='flex bg-gray-100 p-1 rounded-lg'>
								<button
									className={`px-3 py-1.5 text-sm font-medium rounded-md ${
										activeView === "table"
											? "bg-white shadow-sm"
											: "text-gray-600"
									}`}
									onClick={() => setActiveView("table")}>
									Table View
								</button>
								<button
									className={`px-3 py-1.5 text-sm font-medium rounded-md ${
										activeView === "grid"
											? "bg-white shadow-sm"
											: "text-gray-600"
									}`}
									onClick={() => setActiveView("grid")}>
									Card View
								</button>
							</div>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className='p-2 ml-2 bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1'>
								<Download className='h-4 w-4' />
								<span className='text-sm font-medium'>Export</span>
							</motion.button>
						</div>
					</div>

					{activeView === "table" ? <HistoryTable /> : <HistoryCardGrid />}
				</motion.div>
			</div>
		</Fragment>
	);
};

// Updated LocalAutomator component with better routing

const LocalAutomator = () => {



	// Main render
	const Home = () => (
		<Fragment>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>
				<Tabs
					defaultValue='upkeeps'
					className='space-y-8'>
					<TabsList>
						<TabsTrigger value='upkeeps'>Upkeeps</TabsTrigger>
						<TabsTrigger value='new-task'>New Task</TabsTrigger>
						<TabsTrigger value='analytics'>Analytics</TabsTrigger>
						<TabsTrigger value='history'>History</TabsTrigger>
					</TabsList>
					<TabsContent
						value='upkeeps'
						className='space-y-8'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}>
							<h1 className='my-3 mb-6 text-3xl font-medium font-manrope'>
								My UpKeeps
							</h1>
							<UpkeepTable />
						</motion.div>
					</TabsContent>
					<TabsContent
						value='new-task'
						className='space-y-8'>
						<NewTask />
					</TabsContent>
					<TabsContent
						value='analytics'
						className='space-y-8'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}>
							<div className='flex justify-between items-center mb-6'>
								<h1 className='my-3 mb-6 text-3xl font-medium font-manrope'>
									Task Performance Analytics
								</h1>
								<div className='flex gap-2'>
									<select className='px-4 py-2 rounded-xl border border-gray-200'>
										<option value='7d'>Last 7 days</option>
										<option value='30d'>Last 30 days</option>
										<option value='90d'>Last 90 days</option>
									</select>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='p-2 bg-gray-100 rounded-lg'>
										<Filter className='h-5 w-5' />
									</motion.button>
								</div>
							</div>

							<div className='bg-gray-50 border border-gray-100 rounded-xl p-8 flex items-center justify-center'>
								<div className='text-center'>
									<BarChart2 className='h-16 w-16 mx-auto text-gray-300 mb-4' />
									<h3 className='text-xl font-medium text-gray-700 mb-2'>
										Analytics Coming Soon
									</h3>
									<p className='text-gray-500 max-w-md'>
										Task performance analytics and monitoring
										dashboards are currently in development
									</p>
								</div>
							</div>
						</motion.div>
					</TabsContent>
					<TabsContent
						value='history'
						className='space-y-8'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}>
							<h1 className='my-3 mb-6 text-3xl font-medium font-manrope'>
								Transaction History
							</h1>
							<HistoryTable />
						</motion.div>
					</TabsContent>
				</Tabs>
			</div>
		</Fragment>
	);

	return (
		<div className='bg-gray-50 min-h-screen'>
			<ProjectHeader title='Local Automator'>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='px-4 py-2 bg-blue-500 text-white rounded-xl'>
					<Settings className='h-5 w-5' />
				</motion.button>
			</ProjectHeader>
			<Routes>
				{/* Main routes */}
				<Route
					path='/'
					element={<Home />}
				/>
				{/* History routes */}
				<Route
					path='history'
					element={<HistoryHome />}
				/>
				<Route
					path='history/:historyId'
					element={<HistoryDetail />}
				/>
				<Route
					path=':id'
					element={<UpKeepDetails />}
				/>
			</Routes>
		</div>
	);
};

export default LocalAutomator;

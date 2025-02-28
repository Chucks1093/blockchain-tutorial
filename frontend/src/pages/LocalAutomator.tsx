import { useState, Fragment } from "react";
import { motion } from "framer-motion";
import { Settings, Search, Download, BarChart2, Filter } from "lucide-react";
import ProjectHeader from "@/components/common/ProjectHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpkeepTable from "@/components/local-automator/UpKeepCard";

import HistoryTable from "@/components/local-automator/HistoryCard";
import { Route, Routes } from "react-router";
import UpKeepDetails from "@/components/local-automator/UpKeepDetails";
import NewTask from "@/components/local-automator/NewTask";

const LocalAutomator = () => {
	const [filters, setFilters] = useState({
		status: "all",
		timeRange: "all",
		searchTerm: "",
	});
	const [sortOrder, setSortOrder] = useState("newest");

	const exportTaskHistory = () => {
		// Logic to export task history as CSV
		console.log("Exporting task history...");
	};

	// Component for task filters
	const TaskFilters = () => (
		<div className='flex gap-4 mb-6 items-center'>
			<div className='relative flex-1'>
				<Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
				<input
					type='text'
					placeholder='Search tasks...'
					value={filters.searchTerm}
					onChange={(e) =>
						setFilters({ ...filters, searchTerm: e.target.value })
					}
					className='w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200'
				/>
			</div>
			<select
				value={filters.status}
				onChange={(e) => setFilters({ ...filters, status: e.target.value })}
				className='px-4 py-2 rounded-xl border border-gray-200'>
				<option value='all'>All Status</option>
				<option value='active'>Active</option>
				<option value='pending'>Pending</option>
				<option value='cancelled'>Cancelled</option>
			</select>
			<select
				value={sortOrder}
				onChange={(e) => setSortOrder(e.target.value)}
				className='px-4 py-2 rounded-xl border border-gray-200'>
				<option value='newest'>Newest First</option>
				<option value='oldest'>Oldest First</option>
			</select>
			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={exportTaskHistory}
				className='p-2 bg-gray-100 rounded-lg'>
				<Download className='h-5 w-5' />
			</motion.button>
		</div>
	);

	// Execution history item

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
							<TaskFilters />
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
								History
							</h1>
							<HistoryTable />
						</motion.div>
					</TabsContent>
				</Tabs>
			</div>
		</Fragment>
	);

	return (
		<div className='bg-gray-50'>
			<ProjectHeader title='Local Automator'>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='px-4 py-2 bg-blue-500 text-white rounded-xl'>
					<Settings className='h-5 w-5' />
				</motion.button>
			</ProjectHeader>
			<Routes>
				<Route
					element={<Home />}
					index
				/>
				<Route
					element={<UpKeepDetails />}
					path=':id'
				/>
			</Routes>
		</div>
	);
};

export default LocalAutomator;

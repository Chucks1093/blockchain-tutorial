import React, { useState } from "react";

import {
	Lock,
	// Unlock,
	// AlertTriangle,
	Plus,
	// ChevronRight,
	User,
	// Users,
	// Settings,
	RefreshCw,
	// Calendar,
	// DollarSign,
	// Ban,
	CheckCircle,
	ArrowUpRight,
	// ArrowDownRight,
	// History,
	// LineChart as LineChartIcon,
	// PieChart as PieChartIcon,
} from "lucide-react";
// import { BarChart, LineChart } from "@/components/ui/chart";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TokenVestingChart } from "@/components/token-vesting/TokenVestingChart";

import Header from "@/components/common/ProjectHeader";

// Types for Vesting Schedule
interface VestingSchedule {
	id: number;
	beneficiary: string;
	totalAmount: string;
	cliffPeriod: string;
	vestingPeriod: string;
	released: string;
	nextRelease: string;
	status: "active" | "revoked" | "completed";
	startDate: string;
	endDate: string;
	releaseFrequency: "Monthly" | "Quarterly" | "Yearly";
	progress: number;
	history: VestingEvent[];
}

// Types for Vesting Events
interface VestingEvent {
	date: string;
	amount: string;
	type: "release" | "revoke" | "create";
}

// Form types for Create Schedule
interface CreateScheduleForm {
	beneficiary: string;
	amount: number;
	cliffPeriod: number;
	vestingPeriod: number;
	releaseFrequency: "monthly" | "quarterly" | "yearly";
}

// Component props
interface TokenVestingProps {
	onScheduleCreate?: (schedule: CreateScheduleForm) => Promise<void>;
	onScheduleRevoke?: (scheduleId: number) => Promise<void>;
}

// Update your component declaration:
const TokenVesting: React.FC<TokenVestingProps> = () => {
	const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
	const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);
	const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
	const [selectedSchedule, setSelectedSchedule] =
		useState<VestingSchedule | null>(null);

	// Sample vesting schedules with more details
	const schedules: VestingSchedule[] = [
		{
			id: 1,
			beneficiary: "0x1234...5678",
			totalAmount: "100,000",
			cliffPeriod: "6 months",
			vestingPeriod: "24 months",
			released: "25,000",
			nextRelease: "2024-02-15",
			status: "active",
			startDate: "2023-08-15",
			endDate: "2025-08-15",
			releaseFrequency: "Monthly",
			progress: 25,
			history: [
				{ date: "2024-01-15", amount: "12,500", type: "release" },
				{ date: "2023-12-15", amount: "12,500", type: "release" },
			],
		},
		// More schedules...
	];

	const CreateScheduleDialog = () => (
		<Dialog
			open={showCreateModal}
			onOpenChange={setShowCreateModal}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Create Vesting Schedule</DialogTitle>
					<DialogDescription>
						Set up a new token vesting schedule for a beneficiary.
					</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='beneficiary'>Beneficiary Address</Label>
						<Input
							id='beneficiary'
							placeholder='0x...'
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='amount'>Total Amount</Label>
						<Input
							id='amount'
							type='number'
							placeholder='Enter token amount'
						/>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='cliff'>Cliff Period (months)</Label>
							<Input
								id='cliff'
								type='number'
								min='0'
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='vesting'>Vesting Period (months)</Label>
							<Input
								id='vesting'
								type='number'
								min='1'
							/>
						</div>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='frequency'>Release Frequency</Label>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder='Select frequency' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='monthly'>Monthly</SelectItem>
									<SelectItem value='quarterly'>Quarterly</SelectItem>
									<SelectItem value='yearly'>Yearly</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setShowCreateModal(false)}>
						Cancel
					</Button>
					<Button type='submit'>Create Schedule</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	const DetailsDialog = () => (
		<Dialog
			open={showDetailsModal}
			onOpenChange={setShowDetailsModal}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>Schedule Details</DialogTitle>
					<DialogDescription>
						Comprehensive vesting schedule information
					</DialogDescription>
				</DialogHeader>
				{selectedSchedule && (
					<div className='space-y-6'>
						{/* Beneficiary Info */}
						<div className='p-4 bg-gray-50/50 rounded-xl border border-gray-100'>
							<div className='flex items-center gap-3 mb-4'>
								<User className='h-5 w-5 text-gray-500' />
								<div>
									<h4 className='font-medium'>
										{selectedSchedule.beneficiary}
									</h4>
									<p className='text-sm text-gray-500'>
										Started {selectedSchedule.startDate}
									</p>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-gray-500'>End Date</p>
									<p className='font-medium'>
										{selectedSchedule.endDate}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500'>Status</p>
									<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
										{selectedSchedule.status}
									</span>
								</div>
							</div>
						</div>

						{/* Progress and Timeline */}
						<div className='space-y-2'>
							<h4 className='text-sm font-medium'>Vesting Progress</h4>
							<div className='p-4 bg-gray-50/50 rounded-xl border border-gray-100'>
								<div className='mb-4'>
									<div className='flex justify-between text-sm mb-2'>
										<span>Progress</span>
										<span>{selectedSchedule.progress}%</span>
									</div>
									<Progress
										value={selectedSchedule.progress}
										className='h-2'
									/>
								</div>
								<div className='grid grid-cols-3 gap-4 text-sm'>
									<div>
										<p className='text-gray-500'>Cliff Period</p>
										<p className='font-medium'>
											{selectedSchedule.cliffPeriod}
										</p>
									</div>
									<div>
										<p className='text-gray-500'>Vesting Period</p>
										<p className='font-medium'>
											{selectedSchedule.vestingPeriod}
										</p>
									</div>
									<div>
										<p className='text-gray-500'>Frequency</p>
										<p className='font-medium'>
											{selectedSchedule.releaseFrequency}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Token Information */}
						<div className='grid grid-cols-2 gap-4'>
							<div className='p-4 bg-gray-50/50 rounded-xl border border-gray-100'>
								<p className='text-sm text-gray-500 mb-1'>
									Total Amount
								</p>
								<p className='text-xl font-semibold'>
									{selectedSchedule.totalAmount}
								</p>
								<p className='text-xs text-gray-500'>TOKENS</p>
							</div>
							<div className='p-4 bg-gray-50/50 rounded-xl border border-gray-100'>
								<p className='text-sm text-gray-500 mb-1'>
									Released Amount
								</p>
								<p className='text-xl font-semibold'>
									{selectedSchedule.released}
								</p>
								<p className='text-xs text-gray-500'>TOKENS</p>
							</div>
						</div>

						{/* Release History */}
						<div>
							<h4 className='text-sm font-medium mb-3'>
								Release History
							</h4>
							<div className='space-y-2'>
								{selectedSchedule.history.map((event, index) => (
									<div
										key={index}
										className='flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100'>
										<div className='flex items-center gap-2'>
											<CheckCircle className='h-4 w-4 text-green-500' />
											<span className='font-medium'>
												{event.amount} TOKENS
											</span>
										</div>
										<span className='text-sm text-gray-500'>
											{event.date}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);

	const RevokeDialog = () => (
		<Dialog
			open={showRevokeModal}
			onOpenChange={setShowRevokeModal}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Revoke Vesting Schedule</DialogTitle>
					<DialogDescription>
						Are you sure you want to revoke this vesting schedule? This
						action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<Alert variant='destructive'>
					<AlertTitle>Warning</AlertTitle>
					<AlertDescription>
						Revoking will stop all future token releases for this
						schedule.
					</AlertDescription>
				</Alert>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setShowRevokeModal(false)}>
						Cancel
					</Button>
					<Button variant='destructive'>Revoke Schedule</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);

	return (
		<div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100'>
			{/* Header with gradient background */}
			<Header
				title='Token Vesting'
				connectButton='bg-white text-zinc-700 shadow-lg'>
				<Button
					variant='outline'
					className='gap-2'>
					<RefreshCw className='h-4 w-4' />
					Sync
				</Button>
				<Button
					onClick={() => setShowCreateModal(true)}
					className='gap-2 bg-blue-500 hover:bg-blue-600'>
					<Plus className='h-4 w-4' />
					New Schedule
				</Button>
			</Header>

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>
				<Tabs
					defaultValue='overview'
					className='space-y-8'>
					<TabsList>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='schedules'>Schedules</TabsTrigger>
						<TabsTrigger value='analytics'>Analytics</TabsTrigger>
						<TabsTrigger value='history'>History</TabsTrigger>
					</TabsList>

					<TabsContent
						value='overview'
						className='space-y-8'>
						{/* Stats Cards */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
							<Card>
								<CardHeader className='flex flex-row items-center justify-between pb-2'>
									<CardTitle className='text-sm font-medium text-muted-foreground'>
										Total Locked
									</CardTitle>
									<Lock className='h-4 w-4 text-muted-foreground' />
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>150,000</div>
									<div className='text-xs text-muted-foreground'>
										TOKENS
									</div>
									<div className='mt-4 flex items-center gap-2 text-sm'>
										<ArrowUpRight className='h-4 w-4 text-green-500' />
										<span className='text-green-500'>+12.5%</span>
										<span className='text-muted-foreground'>
											from last month
										</span>
									</div>
								</CardContent>
							</Card>

							{/* Similar cards for Released, Active Schedules, Next Release */}
						</div>

						{/* Charts */}
						<div className='grid gap-6 md:grid-cols-2'>
							<TokenVestingChart />
						</div>
					</TabsContent>

					<TabsContent value='schedules'>
						<Card>
							<CardHeader>
								<CardTitle>Active Vesting Schedules</CardTitle>
								<CardDescription>
									Manage and monitor all vesting schedules
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-6'>
									{schedules.map((schedule) => (
										<div
											key={schedule.id}
											className='p-6 bg-gray-50 rounded-lg'>
											<div className='flex items-center justify-between mb-4'>
												<div className='flex items-center gap-4'>
													<User className='h-5 w-5 text-gray-500' />
													<div>
														<h4 className='font-medium'>
															{schedule.beneficiary}
														</h4>
														<p className='text-sm text-gray-500'>
															Started {schedule.startDate}
														</p>
													</div>
												</div>
												<div className='flex items-center gap-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => {
															setSelectedSchedule(schedule);
															setShowDetailsModal(true);
														}}>
														View Details
													</Button>

													<Button
														variant='destructive'
														size='sm'
														onClick={() => {
															setSelectedSchedule(schedule);
															setShowRevokeModal(true);
														}}>
														Revoke
													</Button>
												</div>
											</div>

											<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
												<div>
													<p className='text-sm text-gray-500'>
														Total Amount
													</p>
													<p className='font-medium'>
														{schedule.totalAmount} TOKENS
													</p>
												</div>
												<div>
													<p className='text-sm text-gray-500'>
														Released
													</p>
													<p className='font-medium'>
														{schedule.released} TOKENS
													</p>
												</div>
												<div>
													<p className='text-sm text-gray-500'>
														Release Frequency
													</p>
													<p className='font-medium'>
														{schedule.releaseFrequency}
													</p>
												</div>
												<div>
													<p className='text-sm text-gray-500'>
														Next Release
													</p>
													<p className='font-medium'>
														{schedule.nextRelease}
													</p>
												</div>
											</div>

											<div className='space-y-2'>
												<div className='flex justify-between text-sm'>
													<span>Progress</span>
													<span>{schedule.progress}%</span>
												</div>
												<Progress value={schedule.progress} />
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Add Analytics and History tabs content */}
				</Tabs>
			</div>

			<CreateScheduleDialog />
			<RevokeDialog />
			<DetailsDialog />
		</div>
	);
};

export default TokenVesting;

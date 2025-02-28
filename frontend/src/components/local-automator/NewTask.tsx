import { motion } from "framer-motion";
import {
	FileText,
	Terminal,
	Clock,
	AlertCircle,
	RefreshCw,
	Plus,
	Code,
	ChevronDown,
} from "lucide-react";
import ABIInput from "./ABIInput";
import { useRef, useState } from "react";

// Interface for ABI function
interface AbiInput {
	name: string;
	type: string;
	internalType?: string;
}

interface AbiFunction {
	name: string;
	stateMutability: string;
	inputs: AbiInput[];
}

const LocalAutomationInfo = () => {
	return (
		<div className='bg-white p-6 rounded-lg border border-gray-200 mb-6 h-fit'>
			<p className='text-gray-700 mb-4'>
				Your contract needs to implement the{" "}
				<span className='font-mono text-sm bg-gray-100 px-1 py-0.5 rounded'>
					AutomationCompatibleInterface
				</span>{" "}
				with the{" "}
				<span className='font-mono text-sm bg-gray-100 px-1 py-0.5 rounded'>
					checkUpkeep
				</span>{" "}
				and{" "}
				<span className='font-mono text-sm bg-gray-100 px-1 py-0.5 rounded'>
					performUpkeep
				</span>{" "}
				functions even when using time-based triggers in local development.
			</p>

			<p className='text-gray-700 mb-4'>
				When you create a time-based upkeep, the local automator will:
			</p>

			<ul className='list-disc pl-5 mb-4 text-gray-700 space-y-2'>
				<li>Connect to your local Anvil instance</li>
				<li>
					Register your contract with the simulated automation registry
				</li>
				<li>Call your contract's function at the specified interval</li>
				<li>Log all execution attempts in the console for debugging</li>
			</ul>
		</div>
	);
};

function NewTask() {
	// State for form inputs
	const [abiError, setAbiError] = useState(false);
	const [abiString, setAbiString] = useState<string>("");
	const [abiFunctions, setAbiFunctions] = useState<AbiFunction[]>([]);
	const [selectedFunction, setSelectedFunction] = useState<string>("");
	const [functionDropdownOpen, setFunctionDropdownOpen] = useState(false);

	const contractAddressRef = useRef<HTMLInputElement>(null);
	const intervalRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);

	const [isLoading, setIsLoading] = useState(false);

	const handleCreateTask = () => {
		setIsLoading(true);
		console.log({
			description: descriptionRef.current?.value,
			contractAddress: contractAddressRef.current?.value,
			functionName: selectedFunction, // Use selected function rather than input ref
			interval: intervalRef.current?.value,
			abi: abiString,
		});
		// Add your task creation logic here
		setTimeout(() => setIsLoading(false), 1500);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}>
			<h1 className='my-3 mb-6 text-3xl font-medium font-manrope'>
				Create Automation Task
			</h1>
			<div className='grid grid-cols-2 gap-8'>
				<div className='space-y-6'>
					<div className='relative'>
						<FileText className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
						<input
							ref={descriptionRef}
							type='text'
							placeholder='Task name/description'
							className='w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
						/>
					</div>

					<div className='relative'>
						<Terminal className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
						<input
							ref={contractAddressRef}
							type='text'
							placeholder='Contract address (0x...)'
							className='w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
						/>
					</div>

					<div className='relative'>
						<Clock className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
						<input
							ref={intervalRef}
							type='number'
							placeholder='Time interval (seconds)'
							className='w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200'
						/>
					</div>

					<ABIInput
						setAbiError={setAbiError}
						setAbiString={setAbiString}
						setAbiFunctions={setAbiFunctions}
					/>

					{/* Function selector that appears when ABI is valid */}
					{!abiError && abiFunctions.length > 0 && (
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-700'>
								Select Function
							</label>
							<div className='relative'>
								<div
									className='w-full flex items-center justify-between pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 
                    text-gray-800 cursor-pointer hover:border-blue-300 transition-all duration-200'
									onClick={() =>
										setFunctionDropdownOpen(!functionDropdownOpen)
									}>
									<div className='flex items-center'>
										<Code className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
										<span
											className={
												selectedFunction
													? "text-gray-800"
													: "text-gray-400"
											}>
											{selectedFunction || "Select function to call"}
										</span>
									</div>
									<ChevronDown
										className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
											functionDropdownOpen
												? "transform rotate-180"
												: ""
										}`}
									/>
								</div>

								{/* Dropdown menu */}
								{functionDropdownOpen && (
									<div className='absolute z-10 w-full mt-1 py-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto'>
										{abiFunctions.map((func, index) => (
											<div
												key={index}
												className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
													selectedFunction === func.name
														? "bg-blue-50 text-blue-600"
														: "text-gray-700"
												}`}
												onClick={() => {
													setSelectedFunction(func.name);
													setFunctionDropdownOpen(false);
												}}>
												<div className='font-medium'>
													{func.name}
												</div>
												<div className='text-xs text-gray-500 mt-1'>
													{func.stateMutability} •{" "}
													{func.inputs.length} parameter
													{func.inputs.length !== 1 ? "s" : ""}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
							{selectedFunction && (
								<div className='mt-2'>
									<p className='text-xs text-gray-500'>
										Function signature:
										<span className='font-mono ml-1'>
											{selectedFunction}(
											{abiFunctions
												.find((f) => f.name === selectedFunction)
												?.inputs.map((i) => `${i.type} ${i.name}`)
												.join(", ")}
											)
										</span>
									</p>
								</div>
							)}
						</div>
					)}

					<div className='p-4 bg-blue-50 rounded-xl border border-blue-100'>
						<div className='flex items-start'>
							<AlertCircle className='h-5 w-5 text-blue-500 mt-0.5 mr-3' />
							<div>
								<p className='text-sm text-blue-700'>
									Your task will be funded with LINK tokens to pay for
									Chainlink Automation services. Make sure your
									contract implements the Automation interface
									properly.
								</p>
							</div>
						</div>
					</div>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 
              hover:bg-blue-600 rounded-xl text-white font-medium shadow-lg 
              shadow-blue-500/20 transition-colors duration-200 mt-6'
						onClick={handleCreateTask}
						disabled={isLoading || abiError || !selectedFunction}>
						{isLoading ? (
							<RefreshCw className='h-5 w-5 animate-spin' />
						) : (
							<Plus className='h-5 w-5' />
						)}
						Register Automation Task
					</motion.button>
				</div>
				<LocalAutomationInfo />
			</div>
		</motion.div>
	);
}

export default NewTask;

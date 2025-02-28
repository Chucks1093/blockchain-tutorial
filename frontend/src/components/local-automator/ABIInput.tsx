// ABIInput.tsx with function extraction
import { useState, ChangeEvent } from "react";

interface AbiInput {
	name: string;
	type: string;
	internalType?: string;
	indexed?: boolean;
	components?: AbiInput[];
}

interface AbiOutput {
	name: string;
	type: string;
	internalType?: string;
	components?: AbiOutput[];
}

interface AbiItem {
	type: string; // "function", "event", "constructor", etc.
	name?: string; // Name is optional (constructors don't have names)
	inputs?: AbiInput[];
	outputs?: AbiOutput[];
	stateMutability?: string;
	anonymous?: boolean;
	constant?: boolean;
	payable?: boolean;
}

interface AbiFunction {
	name: string;
	stateMutability: string;
	inputs: AbiInput[];
}

type ABIInputProps = {
	setAbiError: React.Dispatch<React.SetStateAction<boolean>>;
	setAbiString: React.Dispatch<React.SetStateAction<string>>;
	setAbiFunctions: React.Dispatch<React.SetStateAction<AbiFunction[]>>;
};

function ABIInput(props: ABIInputProps) {
	const [abiString, setAbiString] = useState<string>("");
	const [abiError, setAbiError] = useState<boolean>(false);
	const [abiParsed, setAbiParsed] = useState<AbiItem[] | null>(null);

	// ABI validation function
	const validateAbi = (abiStr: string): void => {
		if (!abiStr.trim()) {
			setAbiError(false);
			setAbiParsed(null);
			props.setAbiFunctions([]);
			props.setAbiError(true);
			return;
		}

		try {
			// Try to parse the JSON
			const parsedAbi: unknown = JSON.parse(abiStr);

			// Check if it's an array
			if (!Array.isArray(parsedAbi)) {
				setAbiError(true);
				props.setAbiError(true);
				props.setAbiFunctions([]);
				return;
			}

			// Basic check that all items are objects with at minimum a "type" property
			const isValidAbi = parsedAbi.every(
				(item: unknown) =>
					typeof item === "object" &&
					item !== null &&
					"type" in item &&
					typeof (item as AbiItem).type === "string"
			);

			if (isValidAbi) {
				setAbiParsed(parsedAbi as AbiItem[]);
				props.setAbiString(abiStr);

				// Extract functions and pass to parent
				const functions = parsedAbi
					.filter((item) => item.type === "function")
					.map((item) => ({
						name: item.name,
						stateMutability: item.stateMutability,
						inputs: item.inputs || [],
					}));

				props.setAbiFunctions(functions);
			} else {
				props.setAbiFunctions([]);
			}

			props.setAbiError(!isValidAbi);
			setAbiError(!isValidAbi);
		} catch (e) {
			// If JSON parsing fails, it's not valid
			setAbiError(true);
			setAbiParsed(null);
			props.setAbiError(true);
			props.setAbiFunctions([]);
			console.log(e);
		}
	};

	// Handle ABI text change
	const handleAbiChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
		const newValue = e.target.value;
		setAbiString(newValue);
		validateAbi(newValue);
	};

	// Get function count from valid ABI
	const getFunctionCount = (): number => {
		if (!abiParsed) return 0;
		return abiParsed.filter((item) => item.type === "function").length;
	};

	return (
		<div className='space-y-2'>
			<label className='text-sm font-medium text-gray-700'>
				Contract ABI
			</label>
			<div className='relative'>
				<textarea
					rows={5}
					placeholder='Paste contract ABI here...'
					value={abiString}
					onChange={handleAbiChange}
					className={`w-full p-4 font-mono text-sm rounded-xl bg-white border 
            ${abiError ? "border-red-500" : "border-gray-200"} 
            text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
            ${
					abiError
						? "focus:ring-red-500/20 focus:border-red-500"
						: "focus:ring-blue-500/20 focus:border-blue-500"
				} 
            transition-all duration-200`}
				/>
			</div>
			{abiError && (
				<p className='text-sm text-red-500'>
					Invalid ABI format. Please provide a valid contract ABI.
				</p>
			)}
			{!abiError && abiString && (
				<p className='text-sm text-green-500'>
					Valid ABI detected. Found {getFunctionCount()} functions.
				</p>
			)}
		</div>
	);
}

export default ABIInput;

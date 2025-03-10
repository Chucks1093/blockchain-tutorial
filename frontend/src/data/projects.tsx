import {
	Box,
	Timer,
	Ticket,
	VoteIcon,
	FileCheck,
	Droplet,
	TableRowsSplit,
	CreditCard,
	Award,
	Lock,
	Flame,
	Umbrella,
	BoxIcon,
	MessageSquare,
	Wallet,
	Shield,
} from "lucide-react";

export const projects = [
	{
		title: "Simple Messaging App",
		description:
			"Decentralized messaging with encrypted data stored on Base network",
		category: "Social",
		stack: ["Solidity", "Foundry", "React"],
		metrics: { contracts: 1, tests: 5, complexity: "Easy" },
		demoUrl: "/messaging",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85",
		tag: "messaging",
		icon: <MessageSquare className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Multi-Signature Wallet",
		description:
			"Secure transactions requiring multiple signatures for enhanced wallet safety",
		category: "DeFi",
		stack: ["Solidity", "Hardhat", "React"],
		metrics: { contracts: 3, tests: 45, complexity: "High" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "multisign",
		icon: <Wallet className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Token Vesting",
		description:
			"Gradual token release system with configurable schedules and periods",
		category: "DeFi",
		stack: ["Solidity", "Foundry", "TypeScript"],
		metrics: { contracts: 2, tests: 38, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "vesting",
		icon: <Timer className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Dividend Distributor",
		description:
			"Automated ETH distribution to token holders using snapshot system",
		category: "DeFi",
		stack: ["Solidity", "Hardhat", "NextJS"],
		metrics: { contracts: 4, tests: 52, complexity: "High" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Box className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Staking Rewards",
		description:
			"Earn rewards by staking tokens with compound interest feature",
		category: "DeFi",
		stack: ["Solidity", "Foundry", "React"],
		metrics: { contracts: 3, tests: 41, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <BoxIcon className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Lottery System",
		description:
			"Random winner selection with minimum participation and fair play",
		category: "Gaming",
		stack: ["Solidity", "Hardhat", "React"],
		metrics: { contracts: 2, tests: 35, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Ticket className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Emergency Stop",
		description:
			"Circuit breaker pattern with tiered access for contract safety",
		category: "Security",
		stack: ["Solidity", "Foundry", "Vue"],
		metrics: { contracts: 2, tests: 48, complexity: "High" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Shield className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Simple DAO Voting",
		description:
			"Governance system for decentralized proposal management systems",
		category: "DAO",
		stack: ["Solidity", "Hardhat", "React"],
		metrics: { contracts: 4, tests: 56, complexity: "High" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <VoteIcon className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "NFT Whitelist",
		description: "Merkle tree verification system for tiered NFT minting",
		category: "NFT",
		stack: ["Solidity", "Hardhat", "NextJS"],
		metrics: { contracts: 2, tests: 32, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <FileCheck className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Token Faucet",
		description:
			"Periodic token distribution with cooldowns and claim limits",
		category: "Tools",
		stack: ["Solidity", "Foundry", "React"],
		metrics: { contracts: 1, tests: 28, complexity: "Easy" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Droplet className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Simple Bridge",
		description:
			"Cross-chain token transfer with secure signature verification system",
		category: "DeFi",
		stack: ["Solidity", "Hardhat", "React"],
		metrics: { contracts: 4, tests: 62, complexity: "High" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <TableRowsSplit className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Batch Payment Processor",
		description:
			"Process multiple payments efficiently in single blockchain transaction",
		category: "DeFi",
		stack: ["Solidity", "Foundry", "Vue"],
		metrics: { contracts: 2, tests: 38, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <CreditCard className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Reputation System",
		description: "Track user reputation with action-based scores and decay",
		category: "DAO",
		stack: ["Solidity", "Hardhat", "React"],
		metrics: { contracts: 2, tests: 34, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Award className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Time-Based Access",
		description:
			"Manage contract access with configurable time window controls",
		category: "Security",
		stack: ["Solidity", "Foundry", "React"],
		metrics: { contracts: 2, tests: 42, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Lock className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Token Burner",
		description:
			"Burn tokens automatically based on predefined contract conditions",
		category: "DeFi",
		stack: ["Solidity", "Hardhat", "NextJS"],
		metrics: { contracts: 2, tests: 36, complexity: "Medium" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Flame className='h-6 w-6 text-blue-600' />,
	},
	{
		title: "Simple Insurance",
		description:
			"Smart contract insurance with premium payments and claim verification",
		category: "DeFi",
		stack: ["Solidity", "Foundry", "React"],
		metrics: { contracts: 3, tests: 44, complexity: "High" },
		demoUrl: "#",
		githubUrl: "#",
		contractUrl:
			"https://sepolia.basescan.org/address/0xc15f0f9a02f30f85a515313c9eccdaee48bc6d85#code",
		tag: "messaging",
		icon: <Umbrella className='h-6 w-6 text-blue-600' />,
	},
];

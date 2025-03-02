```ts

import { useState, Fragment } from "react";
import { Link, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
 ChevronDown,
 Clock,
 CheckCircle,
 Calendar,
 Link as LinkIcon,
 FileText,
 BarChart2,
 Trash2,
 PauseCircle,
 PlayCircle,
 DollarSign,
 Terminal,
 AlertTriangle,
 ExternalLink,
 ChevronLeft,
 RefreshCw,
 Share2,
 XCircle,
 Copy,
 Code,
 Zap,
 ShieldAlert,
 Hourglass,
 Repeat,
} from "lucide-react";
import makeBlockie from "ethereum-blockies-base64";
import CopyButton from "../common/CopyButton";
import { formatDistanceToNow } from "date-fns";

// Detailed upkeep data
interface UpkeepData {
 id: string;
 name: string;
 status: "active" | "inactive" | "cancelled" | "paused";
 contractAddress: string;
 registry: string;
 balance: string;
 gasUsed: string;
 createdAt: Date;
 owner: string;
 txHash: string;
 gasLimit: number;
 interval: string;
 minBalance: string;
 totalSpent: string;
 lastExecuted?: Date;
 nextExecution?: Date;
 executionCount: number;
 checkData: string;
 function: string;
 averageGasUsage: string;
 successRate: number;
 registryAddress: string;
 description?: string;
}

// Modal for fund upkeep
const FundUpkeepModal = ({
 isOpen,
 onClose,
 onConfirm,
 upkeepId,
 currentBalance,
}: {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: (amount: string) => void;
 upkeepId: string;
 currentBalance: string;
}) => {
 const [amount, setAmount] = useState("1.0");
 const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = () => {
  setIsLoading(true);
  // Simulate API call
  setTimeout(() => {
   onConfirm(amount);
   setIsLoading(false);
   onClose();
  }, 1000);
 };

 if (!isOpen) return null;

 return (
  <AnimatePresence>
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
    <motion.div
     initial={{ scale: 0.9, opacity: 0 }}
     animate={{ scale: 1, opacity: 1 }}
     exit={{ scale: 0.9, opacity: 0 }}
     className='bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4'>
     <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
      <DollarSign className='h-5 w-5 mr-2 text-blue-500' />
      Add LINK Tokens
     </h3>

     <div className='mb-6'>
      <p className='text-gray-600 mb-4'>
       Fund your upkeep with additional LINK tokens to ensure
       continued operation.
      </p>

      <div className='bg-blue-50 p-3 rounded-lg mb-4'>
       <div className='flex justify-between items-center text-sm'>
        <span className='text-gray-600'>Current Balance:</span>
        <span className='font-medium text-gray-800'>
         {currentBalance}
        </span>
       </div>
      </div>

      <label className='block text-sm font-medium text-gray-700 mb-2'>
       Enter LINK amount to add
      </label>
      <div className='relative'>
       <input
        type='number'
        min='0.1'
        step='0.1'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className='w-full pl-4 pr-16 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'
       />
       <div className='absolute right-4 top-1/2 -translate-y-1/2 font-medium text-gray-500'>
        LINK
       </div>
      </div>
     </div>

     <div className='flex justify-end gap-3'>
      <button
       onClick={onClose}
       className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors'>
       Cancel
      </button>
      <button
       onClick={handleSubmit}
       disabled={isLoading}
       className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors flex items-center'>
       {isLoading ? (
        <>
         <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
         Processing...
        </>
       ) : (
        <>
         <DollarSign className='h-4 w-4 mr-2' />
         Fund Upkeep
        </>
       )}
      </button>
     </div>
    </motion.div>
   </motion.div>
  </AnimatePresence>
 );
};

// Modal for deletion confirmation
const DeleteUpkeepModal = ({
 isOpen,
 onClose,
 onConfirm,
 upkeepId,
}: {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 upkeepId: string;
}) => {
 const [confirmText, setConfirmText] = useState("");
 const [isLoading, setIsLoading] = useState(false);

 const handleDelete = () => {
  setIsLoading(true);
  // Simulate API call
  setTimeout(() => {
   onConfirm();
   setIsLoading(false);
   onClose();
  }, 1000);
 };

 if (!isOpen) return null;

 return (
  <AnimatePresence>
   <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
    <motion.div
     initial={{ scale: 0.9, opacity: 0 }}
     animate={{ scale: 1, opacity: 1 }}
     exit={{ scale: 0.9, opacity: 0 }}
     className='bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4'>
     <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
      <Trash2 className='h-5 w-5 mr-2 text-red-500' />
      Delete Upkeep
     </h3>

     <div className='mb-6'>
      <div className='bg-red-50 border border-red-100 rounded-lg p-4 mb-4'>
       <div className='flex'>
        <AlertTriangle className='h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0' />
        <div>
         <p className='text-sm text-red-800'>
          <strong>Warning:</strong> This action cannot be
          undone. The upkeep will be permanently cancelled
          and any remaining LINK tokens will be returned to
          your wallet.
         </p>
        </div>
       </div>
      </div>

      <p className='text-gray-600 mb-4'>
       To confirm deletion, please type <strong>delete</strong>{" "}
       below.
      </p>

      <input
       type='text'
       value={confirmText}
       onChange={(e) => setConfirmText(e.target.value)}
       placeholder="Type 'delete' to confirm"
       className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500'
      />
     </div>

     <div className='flex justify-end gap-3'>
      <button
       onClick={onClose}
       className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors'>
       Cancel
      </button>
      <button
       onClick={handleDelete}
       disabled={confirmText !== "delete" || isLoading}
       className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500 flex items-center'>
       {isLoading ? (
        <>
         <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
         Deleting...
        </>
       ) : (
        <>
         <Trash2 className='h-4 w-4 mr-2' />
         Delete Upkeep
        </>
       )}
      </button>
     </div>
    </motion.div>
   </motion.div>
  </AnimatePresence>
 );
};

// Main upkeep details component
const UpKeepDetails = () => {
 const { id } = useParams<{ id: string }>();
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [isFundModalOpen, setIsFundModalOpen] = useState(false);
 const [isPaused, setIsPaused] = useState(false);

 // Simulated upkeep data - in a real app, you would fetch this based on the ID
 const upkeep: UpkeepData = {
  id: id || "589221...2051247",
  name: "Oracle Price Update",
  status: "active",
  contractAddress: "0x7439a44bce3a9f68bab9be47831722e735dc9e8e",
  registry: "v2.1",
  registryAddress: "0x86EFBD0b8736Bed994962f9797049422A3A8E8Ad",
  balance: "1.47 LINK",
  gasUsed: "350,450",
  createdAt: new Date("2025-02-25T13:25:00Z"),
  owner: "0x13d8...Fd4d",
  txHash: "0xaf4f...9003",
  gasLimit: 500000,
  interval: "24h",
  minBalance: "0.5 LINK",
  totalSpent: "0.53 LINK",
  lastExecuted: new Date(Date.now() - 3600000 * 2), // 2 hours ago
  nextExecution: new Date(Date.now() + 3600000 * 22), // 22 hours from now
  executionCount: 24,
  checkData: "0x",
  function: "performUpkeep()",
  averageGasUsage: "342,789",
  successRate: 98.2,
  description: "Updates oracle price feeds for core protocol assets",
 };

 // Formatted relative times
 const createdTime = formatDistanceToNow(upkeep.createdAt, {
  addSuffix: true,
 });
 const lastRunTime = upkeep.lastExecuted
  ? formatDistanceToNow(upkeep.lastExecuted, { addSuffix: true })
  : "Never";
 const nextRunTime = upkeep.nextExecution
  ? formatDistanceToNow(upkeep.nextExecution, { addSuffix: false })
  : "Unknown";

 // Status badge component
 const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
   switch (status) {
    case "active":
     return {
      icon: CheckCircle,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
     };
    case "paused":
     return {
      icon: PauseCircle,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
     };
    case "inactive":
     return {
      icon: XCircle,
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
     };
    case "cancelled":
     return {
      icon: XCircle,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
     };
    default:
     return {
      icon: Clock,
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
     };
   }
  };

  const { icon: StatusIcon, bgColor, textColor } = getStatusConfig(status);

  return (
   <div
    className={`inline-flex items-center px-3 py-1.5 rounded-full ${bgColor} ${textColor}`}>
    <StatusIcon className='h-4 w-4 mr-1.5' />
    <span className='font-medium capitalize'>{status}</span>
   </div>
  );
 };

 // Shortened address component with icon
 const AddressDisplay = ({
  address,
  label,
 }: {
  address: string;
  label?: string;
 }) => {
  const shortAddress = address
   ? `${address.substring(0, 6)}...${address.substring(
     address.length - 4
     )}`
   : "";

  return (
   <div className='flex items-center gap-1'>
    <img
     src={makeBlockie(address || "")}
     className='w-7 h-7 rounded-md mr-1 object-cover'
     alt='avatar'
    />
    <div className='flex flex-col'>
     {label && <span className='text-xs text-gray-500'>{label}</span>}
     <div className='flex items-center'>
      <span className='font-manrope text-md font-medium text-blue-500 cursor-pointer'>
       {shortAddress}
      </span>
      <CopyButton textToCopy={address} />
     </div>
    </div>
   </div>
  );
 };

 // Function for handling pause/resume
 const handlePauseToggle = () => {
  setIsPaused(!isPaused);
  // In a real app, you would call an API here
 };

 // Function to handle funding
 const handleFund = (amount: string) => {
  console.log(`Funding upkeep ${id} with ${amount} LINK`);
  // In a real app, you would call an API here
 };

 // Function to handle deletion
 const handleDelete = () => {
  console.log(`Deleting upkeep ${id}`);
  // In a real app, you would call an API here and redirect to the upkeep list
 };

 // Information card component
 const InfoCard = ({
  title,
  children,
  icon: Icon,
  color = "blue",
 }: {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
 }) => {
  const colorMap = {
   blue: "bg-blue-50 text-blue-500",
   green: "bg-green-50 text-green-500",
   red: "bg-red-50 text-red-500",
   yellow: "bg-yellow-50 text-yellow-500",
   purple: "bg-purple-50 text-purple-500",
   gray: "bg-gray-50 text-gray-500",
  };

  return (
   <div className='bg-white border border-gray-200 shadow-sm rounded-lg p-5'>
    <div className='flex items-center justify-between mb-4'>
     <h3 className='text-lg font-medium text-gray-800'>{title}</h3>
     <div className={`p-2 rounded-full ${colorMap[color]}`}>
      <Icon className='h-5 w-5' />
     </div>
    </div>
    {children}
   </div>
  );
 };

 // Progress bar component
 const ProgressBar = ({
  value,
  max,
  color,
 }: {
  value: number;
  max: number;
  color: string;
 }) => {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
   <div className='w-full bg-gray-200 rounded-full h-2.5 my-2'>
    <div
     className={`h-2.5 rounded-full ${color}`}
     style={{ width: `${percentage}%` }}></div>
   </div>
  );
 };

 // Action button dropdown
 const ActionDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
   <div className='relative'>
    <button
     className='px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center'
     onClick={() => setIsOpen(!isOpen)}>
     Actions
     <ChevronDown className='ml-2 h-4 w-4' />
    </button>

    {isOpen && (
     <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
      <div className='py-1'>
       <button
        onClick={() => {
         setIsOpen(false);
         setIsFundModalOpen(true);
        }}
        className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'>
        <DollarSign className='h-4 w-4 mr-2 text-blue-500' />
        Add Funds
       </button>

       <button
        onClick={() => {
         setIsOpen(false);
         handlePauseToggle();
        }}
        className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'>
        {isPaused ? (
         <>
          <PlayCircle className='h-4 w-4 mr-2 text-green-500' />
          Resume Upkeep
         </>
        ) : (
         <>
          <PauseCircle className='h-4 w-4 mr-2 text-yellow-500' />
          Pause Upkeep
         </>
        )}
       </button>

       <button
        onClick={() => {
         setIsOpen(false);
         setIsDeleteModalOpen(true);
        }}
        className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center'>
        <Trash2 className='h-4 w-4 mr-2 text-red-500' />
        Delete Upkeep
       </button>
      </div>
     </div>
    )}
   </div>
  );
 };

 return (
  <Fragment>
   <div className='max-w-7xl mx-auto px-4 md:px-8 py-6'>
    {/* Breadcrumb and header */}
    <div className='mb-8 border-b border-gray-200 pb-4'>
     <Link
      to='/automator'
      className='inline-flex items-center text-blue-600 mb-4 hover:underline'>
      <ChevronLeft className='h-4 w-4 mr-1' />
      Back to Upkeeps
     </Link>

     <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
      <div>
       <div className='flex items-center gap-3'>
        <h1 className='text-3xl font-medium text-gray-900'>
         {upkeep.name}
        </h1>
        <StatusBadge status={upkeep.status} />
       </div>
       <p className='text-gray-500 mt-1'>
        Upkeep ID:{" "}
        <span className='font-mono'>{upkeep.id}</span>
        <CopyButton textToCopy={upkeep.id} />
       </p>
      </div>

      <div className='flex items-center gap-4'>
       <a
        href={`https://automation.chain.link/upkeep/${upkeep.id}`}
        target='_blank'
        rel='noopener noreferrer'
        className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center'>
        View on Chainlink
        <ExternalLink className='h-4 w-4 ml-2' />
       </a>

       <ActionDropdown />
      </div>
     </div>
    </div>

    {/* Main content grid */}
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
     {/* Left column - Upkeep details */}
     <div className='lg:col-span-2 space-y-6'>
      {/* Overview card */}
      <InfoCard
       title='Overview'
       icon={FileText}
       color='blue'>
       <div className='space-y-4'>
        {upkeep.description && (
         <div>
          <h4 className='text-sm font-medium text-gray-500 mb-1'>
           Description
          </h4>
          <p className='text-gray-800'>
           {upkeep.description}
          </p>
         </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
         <div>
          <h4 className='text-sm font-medium text-gray-500 mb-3'>
           Contract Address
          </h4>
          <AddressDisplay
           address={upkeep.contractAddress}
          />
         </div>

         <div>
          <h4 className='text-sm font-medium text-gray-500 mb-3'>
           Registry
          </h4>
          <div className='flex items-center gap-2'>
           <span className='px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md'>
            {upkeep.registry}
           </span>
           <AddressDisplay
            address={upkeep.registryAddress}
           />
          </div>
         </div>

         <div>
          <h4 className='text-sm font-medium text-gray-500 mb-3'>
           Created
          </h4>
          <div className='flex items-center'>
           <Calendar className='h-4 w-4 text-gray-400 mr-2' />
           <span className='text-gray-800'>
            {upkeep.createdAt.toLocaleDateString()}
           </span>
           <span className='text-gray-500 text-sm ml-2'>
            ({createdTime})
           </span>
          </div>
         </div>

         <div>
          <h4 className='text-sm font-medium text-gray-500 mb-3'>
           Owner
          </h4>
          <AddressDisplay address={upkeep.owner} />
         </div>
        </div>
       </div>

       {/* LINK Balance section */}
       <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100'>
        <div className='flex items-center justify-between mb-3'>
         <div className='flex items-center'>
          <LinkIcon className='h-5 w-5 text-blue-500 mr-2' />
          <h4 className='font-medium text-gray-800'>
           LINK Balance
          </h4>
         </div>
         <button
          onClick={() => setIsFundModalOpen(true)}
          className='px-3 py-1 bg-blue-500 text-white text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors'>
          <DollarSign className='h-3.5 w-3.5 mr-1' />
          Add Funds
         </button>
        </div>

        <div className='grid grid-cols-2 gap-4'>
         <div>
          <div className='text-sm text-gray-500 mb-1'>
           Current Balance
          </div>
          <div className='text-2xl font-bold text-blue-600'>
           {upkeep.balance}
          </div>
         </div>

         <div>
          <div className='text-sm text-gray-500 mb-1'>
           Total Spent
          </div>
          <div className='text-lg font-bold text-gray-700'>
           {upkeep.totalSpent}
          </div>
         </div>
        </div>

        <div className='mt-2'>
         <div className='flex justify-between text-xs text-gray-500 mb-1'>
          <span>Minimum Balance: {upkeep.minBalance}</span>
          <span>{upkeep.balance}</span>
         </div>
         <ProgressBar
          value={parseFloat(upkeep.balance)}
          max={5}
          color='bg-blue-500'
         />
        </div>
       </div>
      </InfoCard>

      {/* Execution Information */}
      <InfoCard
       title='Execution Information'
       icon={Zap}
       color='yellow'>
       <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        <div>
         <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Function
         </h4>
         <div className='bg-gray-50 rounded-lg p-3 font-mono text-sm'>
          {upkeep.function}
         </div>
        </div>

        <div>
         <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Check Data
         </h4>
         <div className='bg-gray-50 rounded-lg p-3 font-mono text-sm overflow-auto max-h-24'>
          {upkeep.checkData || "0x"}
         </div>
        </div>
       </div>

       <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6'>
        <div>
         <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Interval
         </h4>
         <div className='flex items-center'>
          <Clock className='h-5 w-5 text-yellow-500 mr-2' />
          <span className='text-lg font-medium'>
           {upkeep.interval}
          </span>
         </div>
        </div>

        <div>
         <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Gas Limit
         </h4>
         <div className='flex items-center'>
          <Zap className='h-5 w-5 text-orange-500 mr-2' />
          <span className='text-lg font-medium'>
           {upkeep.gasLimit.toLocaleString()}
          </span>
         </div>
        </div>

        <div>
         <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Last Executed
         </h4>
         <div className='flex items-center'>
          <Calendar className='h-5 w-5 text-gray-500 mr-2' />
          <span className='text-gray-800'>
           {lastRunTime}
          </span>
         </div>
        </div>
       </div>

       <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center justify-between mb-3'>
         <h4 className='font-medium text-gray-800'>
          Next Execution
         </h4>
         <div className='px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center'>
          <Hourglass className='h-3.5 w-3.5 mr-1' />
          In {nextRunTime}
         </div>
        </div>

        <div className='h-2 bg-gray-200 rounded-full relative'>
         <div
          className='absolute inset-0 flex items-center justify-center'
          style={{ left: "25%" }}>
          <div className='h-4 w-4 rounded-full bg-yellow-400 border-2 border-white shadow'></div>
         </div>
         <div
          className='h-full bg-green-500 rounded-full'
          style={{ width: "25%" }}></div>
        </div>

        <div className='flex justify-between mt-2 text-xs text-gray-500'>
         <span>Last Execution</span>
         <span>Now</span>
         <span>Next Execution</span>
         <span>{upkeep.interval}</span>
        </div>
       </div>
      </InfoCard>

      {/* Performance Metrics */}
      <InfoCard
       title='Performance Metrics'
       icon={BarChart2}
       color='purple'>
       <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
        <div className='bg-gray-50 rounded-lg p-4'>
         <h4 className='text-sm font-medium text-gray-500 mb-1'>
          Total Executions
         </h4>
         <div className='text-2xl font-bold text-gray-800'>
          {upkeep.executionCount}
         </div>
        </div>

        <div className='bg-gray-50 rounded-lg p-4'>
         <h4 className='text-sm font-medium text-gray-500 mb-1'>
          Success Rate
         </h4>
         <div className='text-2xl font-bold text-green-600'>
          {upkeep.successRate}%
         </div>
        </div>

        <div className='bg-gray-50 rounded-lg p-4'>
         <h4 className='text-sm font-medium text-gray-500 mb-1'>
          Avg. Gas Usage
         </h4>
         <div className='text-2xl font-bold text-gray-800'>
          {upkeep.averageGasUsage}
         </div>
        </div>
       </div>

       <div className='mt-6'>
        <h4 className='text-sm font-medium text-gray-500 mb-3'>
         Recent Gas Usage
        </h4>
        <div className='w-full h-24 bg-gray-50 rounded-lg relative'>
         {/* Placeholder for a gas usage chart - in a real app, implement a chart here */}
         <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
          Gas usage chart would appear here
         </div>
        </div>
       </div>

       <div className='mt-4 text-right'>
        <Link
         to={`/automator/history?upkeepId=${upkeep.id}`}
         className='text-blue-600 hover:underline text-sm inline-flex items-center'>
         View all execution history
         <ExternalLink className='h-3.5 w-3.5 ml-1' />
        </Link>
       </div>
      </InfoCard>
     </div>

     {/* Right column - Additional information */}
     <div className='space-y-6'>
      {/* Status card */}
      <InfoCard
       title='Upkeep Status'
       icon={
        upkeep.status === "active"
         ? CheckCircle
         : upkeep.status === "paused"
         ? PauseCircle
         : XCircle
       }
       color={
        upkeep.status === "active"
         ? "green"
         : upkeep.status === "paused"
         ? "yellow"
         : "red"
       }>
       <div className='space-y-4'>
        <div className='p-4 bg-gray-50 rounded-lg'>
         <div className='flex items-center gap-3 mb-3'>
          {upkeep.status === "active" ? (
           <CheckCircle className='h-8 w-8 text-green-500' />
          ) : upkeep.status === "paused" ? (
           <PauseCircle className='h-8 w-8 text-yellow-500' />
          ) : (
           <XCircle className='h-8 w-8 text-red-500' />
          )}

          <div>
           <h4 className='font-medium text-gray-800 capitalize'>
            {upkeep.status}
           </h4>
           <p className='text-sm text-gray-500'>
            {upkeep.status === "active"
             ? "This upkeep is running normally"
             : upkeep.status === "paused"
             ? "This upkeep is temporarily paused"
             : "This upkeep has been cancelled"}
           </p>
          </div>
         </div>

         {upkeep.status === "active" && (
          <button
           onClick={handlePauseToggle}
           className='w-full py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 flex items-center justify-center'>
           <PauseCircle className='h-4 w-4 mr-2' />
           Pause Upkeep
          </button>
         )}

         {upkeep.status === "paused" && (
          <button
           onClick={handlePauseToggle}
           className='w-full py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 flex items-center justify-center'>
           <PlayCircle className='h-4 w-4 mr-2' />
           Resume Upkeep
          </button>
         )}
        </div>

        <div className='space-y-3 text-sm'>
         <div className='flex justify-between py-2 border-b border-gray-100'>
          <span className='text-gray-500'>
           Status Updated
          </span>
          <span className='text-gray-800'>2 days ago</span>
         </div>

         <div className='flex justify-between py-2 border-b border-gray-100'>
          <span className='text-gray-500'>
           Recent Fails
          </span>
          <span className='text-gray-800'>
           0 of last 20
          </span>
         </div>

         <div className='flex justify-between py-2'>
          <span className='text-gray-500'>
           Health Check
          </span>
          <span className='text-green-600 font-medium flex items-center'>
           <CheckCircle className='h-4 w-4 mr-1' />
           Healthy
          </span>
         </div>
        </div>
       </div>
      </InfoCard>

      {/* Technical Details */}
      <InfoCard
       title='Technical Details'
       icon={Terminal}
       color='gray'>
       <div className='space-y-3 text-sm'>
        <div className='flex justify-between py-2 border-b border-gray-100'>
         <span className='text-gray-500'>Network</span>
         <span className='text-gray-800'>
          Ethereum (Mainnet)
         </span>
        </div>

        <div className='flex justify-between py-2 border-b border-gray-100'>
         <span className='text-gray-500'>Registry</span>
         <span className='text-gray-800'>
          {upkeep.registry}
         </span>
        </div>

        <div className='flex justify-between py-2 border-b border-gray-100'>
         <span className='text-gray-500'>Gas Limit</span>
         <span className='text-gray-800'>
          {upkeep.gasLimit.toLocaleString()}
         </span>
        </div>

        <div className='flex justify-between py-2 border-b border-gray-100'>
         <span className='text-gray-500'>
          Average Gas Used
         </span>
         <span className='text-gray-800'>
          {upkeep.averageGasUsage}
         </span>
        </div>

        <div className='flex justify-between py-2'>
         <span className='text-gray-500'>Contract Type</span>
         <span className='text-gray-800'>
          Automation Compatible
         </span>
        </div>
       </div>

       <div className='mt-4 pt-4 border-t border-gray-200'>
        <details className='group'>
         <summary className='flex cursor-pointer items-center text-sm text-blue-600'>
          <span className='hover:underline'>
           View contract interfaces
          </span>
          <ChevronDown className='ml-1 h-4 w-4 transition-transform group-open:rotate-180' />
         </summary>
         <div className='mt-2 rounded-md bg-gray-900 p-3 text-xs font-mono text-gray-300 overflow-auto max-h-40'>
          {`interface AutomationCompatibleInterface {
  function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
  function performUpkeep(bytes calldata performData) external;
}`}
         </div>
        </details>
       </div>
      </InfoCard>

      {/* Notifications card */}
      <InfoCard
       title='Notifications'
       icon={ShieldAlert}
       color='red'>
       <div className='space-y-4'>
        <div className='flex items-start space-x-3 p-3 bg-green-50 rounded-lg'>
         <CheckCircle className='h-5 w-5 text-green-500 mt-0.5' />
         <div>
          <h4 className='font-medium text-gray-800'>
           All Systems Operational
          </h4>
          <p className='text-sm text-gray-600'>
           Your upkeep is running as expected with no
           issues.
          </p>
         </div>
        </div>

        <div className='p-3 border border-gray-200 rounded-lg'>
         <div className='flex items-center justify-between mb-3'>
          <h4 className='font-medium text-gray-800'>
           Email Alerts
          </h4>
          <div className='relative inline-flex items-center cursor-pointer'>
           <input
            type='checkbox'
            value=''
            id='email-toggle'
            className='sr-only peer'
            defaultChecked
           />
           <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </div>
         </div>
         <p className='text-sm text-gray-600'>
          Receive alerts about upkeep failures, low
          balances, or other issues.
         </p>
        </div>
       </div>
      </InfoCard>

      {/* Recent transactions card */}
      <div className='bg-white border border-gray-200 shadow-sm rounded-lg p-5'>
       <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-medium text-gray-800'>
         Recent Transactions
        </h3>
        <div className='p-2 rounded-full bg-blue-50 text-blue-500'>
         <Repeat className='h-5 w-5' />
        </div>
       </div>

       <div className='space-y-3'>
        <div className='p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'>
         <div className='flex justify-between items-center mb-1'>
          <span className='font-medium text-gray-800'>
           Perform Upkeep
          </span>
          <span className='text-xs text-gray-500'>
           2 hours ago
          </span>
         </div>
         <div className='flex justify-between items-center'>
          <span className='text-xs font-mono text-blue-500 truncate max-w-[150px]'>
           0x8494...c8b2
          </span>
          <span className='text-xs text-green-600'>
           Success
          </span>
         </div>
        </div>

        <div className='p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'>
         <div className='flex justify-between items-center mb-1'>
          <span className='font-medium text-gray-800'>
           Perform Upkeep
          </span>
          <span className='text-xs text-gray-500'>
           1 day ago
          </span>
         </div>
         <div className='flex justify-between items-center'>
          <span className='text-xs font-mono text-blue-500 truncate max-w-[150px]'>
           0x7b7e...e061
          </span>
          <span className='text-xs text-green-600'>
           Success
          </span>
         </div>
        </div>

        <div className='p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'>
         <div className='flex justify-between items-center mb-1'>
          <span className='font-medium text-gray-800'>
           Add Funds
          </span>
          <span className='text-xs text-gray-500'>
           3 days ago
          </span>
         </div>
         <div className='flex justify-between items-center'>
          <span className='text-xs font-mono text-blue-500 truncate max-w-[150px]'>
           0x0b50...0631
          </span>
          <span className='text-xs text-gray-600'>
           +2.0 LINK
          </span>
         </div>
        </div>
       </div>

       <div className='mt-4 text-center'>
        <Link
         to={`/automator/history?upkeepId=${upkeep.id}`}
         className='text-blue-600 hover:underline text-sm'>
         View all transactions
        </Link>
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Modals */}
   <FundUpkeepModal
    isOpen={isFundModalOpen}
    onClose={() => setIsFundModalOpen(false)}
    onConfirm={handleFund}
    upkeepId={upkeep.id}
    currentBalance={upkeep.balance}
   />

   <DeleteUpkeepModal
    isOpen={isDeleteModalOpen}
    onClose={() => setIsDeleteModalOpen(false)}
    onConfirm={handleDelete}
    upkeepId={upkeep.id}
   />
  </Fragment>
 );
};

export default UpKeepDetails;
```
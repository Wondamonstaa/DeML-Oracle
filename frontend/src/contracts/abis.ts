// frontend/src/contracts/abis.ts

// Human-readable ABI for OracleManager
export const ORACLE_MANAGER_ABI = [
  // Functions
  "function registerProvider() public",
  "function stake() public payable",
  "function getProviderStake(address provider) public view returns (uint256)",
  "function isProviderRegistered(address provider) public view returns (bool)",
  "function MIN_STAKE() public view returns (uint256)", // Added for fetching min stake

  // Events
  "event ProviderRegistered(address indexed provider)",
  "event ProviderStaked(address indexed provider, uint256 amount)"
];
// Hardhat Local Network Deployed Addresses (Example)
export const ORACLE_MANAGER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


// Human-readable ABI for RequestBridge
export const REQUEST_BRIDGE_ABI = [
  // Functions
  "function requestPrediction(bytes calldata inputData, uint256 modelId) public returns (uint256 requestId)",
  "function nextRequestId() public view returns (uint256)", // If you want to display next ID

  // Events
  "event PredictionRequested(uint256 indexed requestId, address indexed requestor, uint256 modelId, bytes inputData)"
];
export const REQUEST_BRIDGE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";


// Human-readable ABI for ResultValidator
export const RESULT_VALIDATOR_ABI = [
  // Functions
  "function submitPrediction(uint256 requestId, bytes calldata predictionData) public",
  "function getPredictionsForRequest(uint256 requestId) public view returns ((address provider, bytes data, uint256 timestamp)[] memory)",
  // Assuming OracleManager address is public in ResultValidator for display/verification if needed
  "function oracleManager() public view returns (address)",

  // Events
  "event PredictionSubmitted(uint256 indexed requestId, address indexed provider, bytes predictionData)"
];
export const RESULT_VALIDATOR_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// --- Event and Struct Interfaces ---

export interface PredictionRequestEvent {
  // From PredictionRequested event
  requestId: string; // ethers.BigNumberish.toString()
  requestor: string;
  modelId: string;   // ethers.BigNumberish.toString()
  inputData: string; // hex string from bytes, or decoded string
  // Optional: from event log itself
  blockNumber?: number;
  transactionHash?: string;
}

export interface Prediction {
  // Structure from ResultValidator.getPredictionsForRequest
  provider: string;
  data: string;     // hex string from bytes, or decoded string
  timestamp: string;  // ethers.BigNumberish.toString(), can be converted to Date
  // Optional: from event log if listening to PredictionSubmitted
  blockNumber?: number;
  transactionHash?: string;
}

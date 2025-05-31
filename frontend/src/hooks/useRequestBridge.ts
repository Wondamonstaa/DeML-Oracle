import { ethers, EventLog } from 'ethers'; // Added EventLog
import { useCallback, useMemo, useState, useEffect } from 'react';
import useWalletStore from '../store/walletStore';
import { REQUEST_BRIDGE_ABI, REQUEST_BRIDGE_ADDRESS, PredictionRequestEvent } from '../contracts/abis'; // Added PredictionRequestEvent

export const useRequestBridge = () => {
  const { provider, signer, account } = useWalletStore();
  const [loading, setLoading] = useState<boolean>(false); // General loading for single actions
  const [fetchingRequests, setFetchingRequests] = useState<boolean>(false); // Specific loading for fetching all requests
  const [error, setError] = useState<string | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const [allRequests, setAllRequests] = useState<PredictionRequestEvent[]>([]);

  const requestBridgeContract = useMemo(() => {
    if (!provider || !REQUEST_BRIDGE_ADDRESS || REQUEST_BRIDGE_ADDRESS === "YOUR_DEPLOYED_REQUEST_BRIDGE_ADDRESS") {
      return null;
    }
    const contractProviderOrSigner = signer || provider; // Use signer if available for transactions
    return new ethers.Contract(REQUEST_BRIDGE_ADDRESS, REQUEST_BRIDGE_ABI, contractProviderOrSigner);
  }, [provider, signer]);

  const fetchAllPredictionRequestsInternal = useCallback(async (): Promise<PredictionRequestEvent[]> => {
    if (!requestBridgeContract) {
      setError("Cannot fetch requests: Contract not initialized.");
      return [];
    }
    setFetchingRequests(true);
    setError(null);
    try {
      // Query for all PredictionRequested events
      const eventFilter = requestBridgeContract.filters.PredictionRequested();
      const logs = await requestBridgeContract.queryFilter(eventFilter);

      const parsedRequests: PredictionRequestEvent[] = logs.map(log => {
        // Ensure log is an EventLog before accessing args
        if (log instanceof EventLog && log.args) {
          return {
            requestId: log.args.requestId.toString(),
            requestor: log.args.requestor,
            modelId: log.args.modelId.toString(),
            inputData: ethers.isBytesLike(log.args.inputData) ? ethers.toUtf8String(log.args.inputData) : log.args.inputData, // Attempt decode
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
          };
        }
        // Fallback for unknown log structure, though queryFilter should return EventLog instances
        console.warn("Log structure not as expected:", log);
        return null;
      }).filter(req => req !== null) as PredictionRequestEvent[];

      setAllRequests(parsedRequests.sort((a, b) => parseInt(b.requestId) - parseInt(a.requestId))); // Sort newest first
      return parsedRequests;
    } catch (e: any) {
      console.error("Error fetching all prediction requests:", e);
      setError(e.message || "Failed to fetch prediction requests.");
      setAllRequests([]);
      return [];
    } finally {
      setFetchingRequests(false);
    }
  }, [requestBridgeContract]);

  const requestPredictionInternal = useCallback(async (inputData: string, modelId: string) => {
    if (!requestBridgeContract || !signer) {
      setError("Cannot request prediction: Wallet not connected or contract not initialized.");
      // Ensure this path returns null or throws, consistent with its signature if it expects a return
      return null;
    }
    setLoading(true); // For the specific action of requesting a new prediction
    setError(null);
    setLastRequestId(null);

    try {
      const bytesInputData = ethers.toUtf8Bytes(inputData);
      const modelIdValue = BigInt(modelId); // Smart contract might expect uint256, which is BigInt in ethers v6

      // Estimate gas or use a fixed gas limit if needed, but usually not required for local dev
      const tx = await requestBridgeContract.connect(signer).requestPrediction(bytesInputData, modelIdValue);

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // Find the PredictionRequested event in the transaction receipt
      // The event name as defined in the ABI
      const eventName = "PredictionRequested";
      let emittedRequestId: string | null = null;

      if (receipt && receipt.logs) {
        // Iterate through logs to find the event by its signature or by parsing
        for (const log of receipt.logs) {
            try {
                const parsedLog = requestBridgeContract.interface.parseLog(log);
                if (parsedLog && parsedLog.name === eventName) {
                    emittedRequestId = parsedLog.args.requestId.toString();
                    break;
                }
            } catch (e) {
                // This log was not from our contract or not the event we are looking for
                // console.debug("Could not parse log:", log, e);
            }
        }
      }


      if (emittedRequestId) {
        setLastRequestId(emittedRequestId);
        console.log(`PredictionRequested event found, requestId: ${emittedRequestId}`);
        return emittedRequestId;
      } else {
        // Fallback if event parsing is difficult or fails: try to get it from return value (less common for non-view)
        // Or, if the function returns the ID directly (as per our ABI)
        // Note: Hardhat's ethers wrapper might make return values accessible directly for simple cases.
        // For a real chain, relying on events or calling a view function post-tx is more robust.
        // The ABI says: "returns (uint256 requestId)", so Hardhat might extract this.
        // However, the `tx.wait()` receipt is the standard way to get event data.
        // If the contract *does* return the value and ethers.js v6 surfaces it, it might be in `receipt.value` or similar,
        // but this is not standard. The robust way is parsing logs.
        // The provided ABI implies a return value. Let's assume for now the event is the primary source.
        console.warn("Could not find PredictionRequested event in transaction receipt logs.");
        setError("Failed to retrieve request ID from transaction events. The transaction may have succeeded.");
        // If the contract *truly* returns the requestId from the state-changing function,
        // it's typically not directly available in `tx` or `receipt` in a simple way without specific handling
        // or if the library (ethers) does some magic. Events are the standard.
        // The `requestPrediction` function in the ABI is marked `returns (uint256 requestId)`.
        // In some environments (like Hardhat tests or direct calls), this return value might be directly accessible.
        // When called via `contract.connect(signer).function()`, the return is a TransactionResponse.
        // If the function *did* return a value, it might be implicitly handled by ethers.js if you call it differently (e.g. `callStatic`).
        // For now, we rely on the event.
        return null;
      }
    } catch (e: any) {
      console.error("Error requesting prediction:", e);
      setError(e.message || "Failed to request prediction.");
      if (e.data && e.data.message) { // Check for Hardhat/node specific error messages
        setError(`Transaction reverted: ${e.data.message}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestBridgeContract, signer]);

    // Global event listener (optional for now, as per prompt)
    useEffect(() => {
        if (!requestBridgeContract || !account) return;

        const globalPredictionRequestListener = (requestId: ethers.BigNumberish, requestor: string, modelId: ethers.BigNumberish, inputData: string) => {
            console.log(`Global Event: PredictionRequested seen. ID: ${requestId.toString()}, By: ${requestor}, Model: ${modelId.toString()}`);
            // Here you could update a global list of requests if needed for a dashboard.
            // For example, if the current user made this request, you could highlight it.
            // if (requestor.toLowerCase() === account.toLowerCase()) {
            //   // Maybe setLastRequestId(requestId.toString()) if it's relevant to show the user their latest global request
            // }
        };

        requestBridgeContract.on('PredictionRequested', globalPredictionRequestListener);

        return () => {
            requestBridgeContract.off('PredictionRequested', globalPredictionRequestListener);
        };
    }, [requestBridgeContract, account]);


  return {
    loading,
    error,
    lastRequestId,
    requestPrediction: requestPredictionInternal,
    contractAddress: REQUEST_BRIDGE_ADDRESS,
    isContractInitialized: !!requestBridgeContract,
  };
};

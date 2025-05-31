import { ethers } from 'ethers';
import { useCallback, useMemo, useState, useEffect } from 'react';
import useWalletStore from '../store/walletStore';
import { RESULT_VALIDATOR_ABI, RESULT_VALIDATOR_ADDRESS, Prediction } from '../contracts/abis';

export const useResultValidator = () => {
  const { provider, signer, account } = useWalletStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultValidatorContract = useMemo(() => {
    if (!provider || !RESULT_VALIDATOR_ADDRESS || RESULT_VALIDATOR_ADDRESS === "YOUR_DEPLOYED_RESULT_VALIDATOR_ADDRESS") {
      return null;
    }
    const contractProviderOrSigner = signer || provider;
    return new ethers.Contract(RESULT_VALIDATOR_ADDRESS, RESULT_VALIDATOR_ABI, contractProviderOrSigner);
  }, [provider, signer]);

  const submitPredictionInternal = useCallback(async (requestId: string, predictionData: string) => {
    if (!resultValidatorContract || !signer) {
      setError("Cannot submit prediction: Wallet not connected or contract not initialized.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const bytesPredictionData = ethers.toUtf8Bytes(predictionData);
      const requestIdValue = BigInt(requestId);

      const tx = await resultValidatorContract.connect(signer).submitPrediction(requestIdValue, bytesPredictionData);
      await tx.wait();
      console.log("Prediction submitted successfully, TX:", tx.hash);
      return true;
    } catch (e: any) {
      console.error("Error submitting prediction:", e);
      setError(e.message || "Failed to submit prediction.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [resultValidatorContract, signer]);

  const fetchPredictionsForRequestInternal = useCallback(async (requestId: string): Promise<Prediction[]> => {
    if (!resultValidatorContract) {
      setError("Cannot fetch predictions: Contract not initialized.");
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const requestIdValue = BigInt(requestId);
      const predictionsResult = await resultValidatorContract.getPredictionsForRequest(requestIdValue);

      // Parse results into the Prediction[] interface
      const parsedPredictions: Prediction[] = predictionsResult.map((p: any) => ({
        provider: p.provider,
        data: ethers.isBytesLike(p.data) ? ethers.toUtf8String(p.data) : p.data, // Attempt to decode if bytes
        timestamp: p.timestamp.toString(), // Convert BigInt to string
      }));
      return parsedPredictions;
    } catch (e: any) {
      console.error(`Error fetching predictions for request ID ${requestId}:`, e);
      setError(e.message || `Failed to fetch predictions for request ID ${requestId}.`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [resultValidatorContract]);

  // Optional: Global listener for PredictionSubmitted events
  useEffect(() => {
    if (!resultValidatorContract || !account) return;

    const globalPredictionSubmittedListener = (
        reqId: ethers.BigNumberish,
        providerAddr: string,
        data: string // bytes from event
    ) => {
        const reqIdStr = reqId.toString();
        console.log(
            `Global Event: PredictionSubmitted for Request ID ${reqIdStr} by ${providerAddr}. Data: ${ethers.toUtf8String(data)}`
        );
        // Here you could trigger a re-fetch or update a specific part of the UI
        // if this event is relevant to what's currently displayed.
        // For example, if a user is viewing submissions for reqIdStr, you could refresh that view.
    };

    resultValidatorContract.on('PredictionSubmitted', globalPredictionSubmittedListener);

    return () => {
        resultValidatorContract.off('PredictionSubmitted', globalPredictionSubmittedListener);
    };
  }, [resultValidatorContract, account]);


  return {
    loading,
    error,
    submitPrediction: submitPredictionInternal,
    fetchPredictionsForRequest: fetchPredictionsForRequestInternal,
    contractAddress: RESULT_VALIDATOR_ADDRESS,
    isContractInitialized: !!resultValidatorContract,
  };
};

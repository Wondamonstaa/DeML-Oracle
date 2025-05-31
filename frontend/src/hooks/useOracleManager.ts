import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useWalletStore from '../store/walletStore';
import { ORACLE_MANAGER_ABI, ORACLE_MANAGER_ADDRESS } from '../contracts/abis';

export const useOracleManager = () => {
  const { provider, signer, account } = useWalletStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("0.0"); // In Ether string format
  const [registrationStatus, setRegistrationStatus] = useState<boolean | null>(null);
  const [minStakeEth, setMinStakeEth] = useState<string>("0.0");

  const oracleManagerContract = useMemo(() => {
    if (!provider || !ORACLE_MANAGER_ADDRESS || ORACLE_MANAGER_ADDRESS === "YOUR_DEPLOYED_ORACLE_MANAGER_ADDRESS") {
      // console.warn("OracleManager contract not initialized: Provider or address missing.");
      return null;
    }
    // If using a signer for write transactions, or provider for read-only
    const contractProviderOrSigner = signer || provider;
    return new ethers.Contract(ORACLE_MANAGER_ADDRESS, ORACLE_MANAGER_ABI, contractProviderOrSigner);
  }, [provider, signer]);

  const fetchMinStake = useCallback(async () => {
    if (!oracleManagerContract) {
      // setError("Contract not initialized. Connect wallet or ensure address is correct.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const minStakeWei = await oracleManagerContract.MIN_STAKE();
      setMinStakeEth(ethers.formatEther(minStakeWei));
    } catch (e: any) {
      console.error("Error fetching min stake:", e);
      setError(e.message || "Failed to fetch minimum stake.");
    } finally {
      setLoading(false);
    }
  }, [oracleManagerContract]);


  const registerProviderInternal = useCallback(async () => {
    if (!oracleManagerContract || !signer) {
      setError("Cannot register: Wallet not connected or contract not initialized.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await oracleManagerContract.connect(signer).registerProvider();
      await tx.wait();
      // After successful registration, update status
      await checkRegistrationInternal(await signer.getAddress());
    } catch (e: any) {
      console.error("Error registering provider:", e);
      setError(e.message || "Failed to register provider.");
    } finally {
      setLoading(false);
    }
  }, [oracleManagerContract, signer]);

  const stakeEtherInternal = useCallback(async (amountInEther: string) => {
    if (!oracleManagerContract || !signer) {
      setError("Cannot stake: Wallet not connected or contract not initialized.");
      return;
    }
    if (parseFloat(amountInEther) <= 0) {
        setError("Stake amount must be greater than zero.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const weiValue = ethers.parseEther(amountInEther);
      const tx = await oracleManagerContract.connect(signer).stake({ value: weiValue });
      await tx.wait();
      // After successful staking, update stake amount
      await fetchStakeInternal(await signer.getAddress());
    } catch (e: any) {
      console.error("Error staking Ether:", e);
      setError(e.message || "Failed to stake Ether.");
    } finally {
      setLoading(false);
    }
  }, [oracleManagerContract, signer]);

  const fetchStakeInternal = useCallback(async (providerAddress: string) => {
    if (!oracleManagerContract || !providerAddress) {
    //   setError("Cannot fetch stake: Contract not initialized or provider address missing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const stakeInWei = await oracleManagerContract.getProviderStake(providerAddress);
      setStakeAmount(ethers.formatEther(stakeInWei));
    } catch (e: any) {
      console.error("Error fetching stake:", e);
      setStakeAmount("0.0"); // Reset on error
      setError(e.message || "Failed to fetch stake amount.");
    } finally {
      setLoading(false);
    }
  }, [oracleManagerContract]);

  const checkRegistrationInternal = useCallback(async (providerAddress: string) => {
    if (!oracleManagerContract || !providerAddress) {
    //   setError("Cannot check registration: Contract not initialized or provider address missing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const isRegistered = await oracleManagerContract.isProviderRegistered(providerAddress);
      setRegistrationStatus(isRegistered);
    } catch (e: any) {
      console.error("Error checking registration:", e);
      setRegistrationStatus(null); // Reset on error
      setError(e.message || "Failed to check registration status.");
    } finally {
      setLoading(false);
    }
  }, [oracleManagerContract]);

  // Effect for listening to events
  useEffect(() => {
    if (!oracleManagerContract || !account) return;

    const onProviderRegistered = (providerAddr: string) => {
      console.log('Event: ProviderRegistered', providerAddr);
      if (providerAddr.toLowerCase() === account.toLowerCase()) {
        checkRegistrationInternal(account);
      }
    };

    const onProviderStaked = (providerAddr: string, amount: bigint) => {
      console.log('Event: ProviderStaked', providerAddr, ethers.formatEther(amount));
      if (providerAddr.toLowerCase() === account.toLowerCase()) {
        fetchStakeInternal(account);
      }
    };

    oracleManagerContract.on('ProviderRegistered', onProviderRegistered);
    oracleManagerContract.on('ProviderStaked', onProviderStaked);

    // Fetch initial min stake when contract is ready
    fetchMinStake();

    return () => {
      oracleManagerContract.off('ProviderRegistered', onProviderRegistered);
      oracleManagerContract.off('ProviderStaked', onProviderStaked);
    };
  }, [oracleManagerContract, account, checkRegistrationInternal, fetchStakeInternal, fetchMinStake]);

  return {
    loading,
    error,
    stakeAmount,
    registrationStatus,
    minStakeEth,
    registerProvider: registerProviderInternal,
    stakeEther: stakeEtherInternal,
    fetchStake: fetchStakeInternal,
    checkRegistration: checkRegistrationInternal,
    fetchMinStake, // Expose if needed by UI directly
    contractAddress: ORACLE_MANAGER_ADDRESS, // Expose address for display
    isContractInitialized: !!oracleManagerContract,
  };
};

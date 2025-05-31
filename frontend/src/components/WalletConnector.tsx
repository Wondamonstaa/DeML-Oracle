import React, { useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import useWalletStore from '../store/walletStore';
import { Button, Typography, Box, Chip } from '@mui/material'; // Import MUI components
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

declare global {
  interface Window {
    ethereum?: any; // Using `any` for now to cover different EIP-1193 provider structures
  }
}

const WalletConnector: React.FC = () => {
  const { account, provider, chainId, setAccount, setChainId, setProvider, setSigner, disconnect } = useWalletStore();

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum, 'any');
        await web3Provider.send('eth_requestAccounts', []);
        const signerInstance = await web3Provider.getSigner();
        const address = await signerInstance.getAddress();
        const network = await web3Provider.getNetwork();

        setProvider(web3Provider);
        setSigner(signerInstance);
        setAccount(address);
        setChainId(Number(network.chainId));

      } catch (error: any) {
        console.error("Error connecting wallet:", error);
        if (error.code === 4001) {
          // User rejected request - no need for an aggressive alert here, console is fine.
          console.log("Wallet connection request rejected by user.");
        } else {
          alert(`Error connecting wallet: ${error.message || "Unknown error"}`);
        }
        handleDisconnect();
      }
    } else {
      alert('Please install an Ethereum-compatible wallet like MetaMask!');
    }
  }, [setProvider, setSigner, setAccount, setChainId, handleDisconnect]);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth || !account) { // Only set up listeners if initially connected or account becomes available
        // If not connected, or account is lost, ensure listeners are not active or are cleaned up.
        // The return function handles cleanup.
        return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length === 0) {
        handleDisconnect();
      } else if (accounts[0].toLowerCase() !== account.toLowerCase()) { // Check if account actually changed
        setAccount(accounts[0]);
        if (provider) {
          (async () => {
            try {
              const signerInstance = await provider.getSigner();
              setSigner(signerInstance);
            } catch (e) {
                console.error("Error re-fetching signer on account change:", e);
                handleDisconnect();
            }
          })();
        } else {
            connectWallet(); // Attempt to re-connect with new account context
        }
      }
    };

    const handleChainChanged = (newChainIdHex: string) => {
      console.log("Network changed to:", newChainIdHex);
      const newChainId = parseInt(newChainIdHex, 16);
      setChainId(newChainId);
      // Re-initialize provider and signer for the new chain
      if (window.ethereum) {
        (async () => {
            try {
                const web3Provider = new ethers.BrowserProvider(window.ethereum, 'any');
                setProvider(web3Provider); // Set new provider for new chain
                if (account) {
                    const signerInstance = await web3Provider.getSigner();
                    setSigner(signerInstance); // Get signer for new chain context
                }
            } catch (e) {
                console.error("Error re-initializing provider on chain change:", e);
                handleDisconnect(); // If setup fails, disconnect
            }
        })();
      }
    };

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);

    return () => {
      if (eth && typeof eth.removeListener === 'function') {
        eth.removeListener('accountsChanged', handleAccountsChanged);
        eth.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, provider, handleDisconnect, setAccount, setChainId, setProvider, setSigner, connectWallet]);


  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {account ? (
        <>
          <Chip
            icon={<AccountBalanceWalletIcon />}
            label={`${account.substring(0, 6)}...${account.substring(account.length - 4)} (Chain: ${chainId || 'N/A'})`}
            variant="outlined"
            sx={{ color: 'text.primary', borderColor: 'text.secondary' }}
          />
          <Button
            variant="outlined"
            color="secondary" // Use theme's secondary color (yellow)
            onClick={handleDisconnect}
            size="small"
            startIcon={<PowerSettingsNewIcon />}
            sx={{textTransform: 'none'}}
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Button
            variant="contained"
            color="secondary" // Use theme's secondary color (yellow)
            onClick={connectWallet}
            startIcon={<AccountBalanceWalletIcon />}
        >
          Connect Wallet
        </Button>
      )}
    </Box>
  );
};

export default WalletConnector;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, CircularProgress,
  Alert, Grid, Stack, Paper, Divider, Chip
} from '@mui/material';
import { ethers } from 'ethers';
import { useOracleManager } from '../hooks/useOracleManager';
import useWalletStore from '../store/walletStore';
import { Fade } from '@mui/material'; // For transitions
import StyledButton from '../components/common/StyledButton'; // Assuming you have this
import InfoCard from '../components/common/InfoCard'; // Assuming you have this

const StakingPage: React.FC = () => {
  const { account, signer } = useWalletStore();
  const {
    loading, error, stakeAmount, registrationStatus, minStakeEth,
    registerProvider, stakeEther, fetchStake, checkRegistration,
    contractAddress, isContractInitialized
  } = useOracleManager();

  const [stakeInput, setStakeInput] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const displaySuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
  };

  const handleRefreshStatus = useCallback(() => {
    if (account && isContractInitialized) {
      fetchStake(account);
      checkRegistration(account);
    }
  }, [account, fetchStake, checkRegistration, isContractInitialized]);

  useEffect(() => {
    if (account && isContractInitialized) {
      handleRefreshStatus();
    }
  }, [account, isContractInitialized, handleRefreshStatus]);

  useEffect(() => {
    if (minStakeEth && parseFloat(minStakeEth) > 0) {
        setStakeInput(minStakeEth); // Pre-fill with min stake if available
    }
  }, [minStakeEth]);


  const handleRegister = async () => {
    if (!isContractInitialized) return;
    const success = await registerProvider(); // Assuming hook returns boolean or updates status that can be checked
    // For now, success is implied if no error is set by the hook and loading finishes.
    // A more robust hook would return a clear success status for the transaction.
    // We'll rely on the error state from the hook for now.
    // If an error occurs, it's shown. If not, the status refresh will show the new state.
    // Let's add a success message if no error was set by the hook after the operation.
    if (!error) { // Check error state from hook AFTER operation
        displaySuccess("Registration successful! Status will update.");
    }
  };

  const handleStake = async () => {
    if (!isContractInitialized || !stakeInput) return;
    if (parseFloat(stakeInput) <=0) {
        // setError in hook or local state would be better than alert
        alert("Stake amount must be positive.");
        return;
    }
    await stakeEther(stakeInput);
    if (!error) {
        displaySuccess("Stake successful! Your stake amount will update.");
        setStakeInput(minStakeEth || "0"); // Reset input to min/default
    }
  };

  const isReadyToTransact = account && signer && isContractInitialized;

  if (contractAddress === "YOUR_DEPLOYED_ORACLE_MANAGER_ADDRESS") {
    return (
        <Alert severity="warning" sx={{ m: 2 }}>
            Oracle Manager contract address is not set. Please configure it in <code>frontend/src/contracts/abis.ts</code>.
        </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom component="div">
        Provider Staking
      </Typography>
      <Chip label={`OracleManager Contract: ${contractAddress}`} sx={{mb: 2}} />


      {!account && (
        <Alert severity="info" sx={{mb: 2}}>Please connect your wallet to manage staking.</Alert>
      )}

      <Fade in={!!error}>
        <Alert severity="error" sx={{ my: 2, width: '100%' }}>
          {error}
        </Alert>
      </Fade>
      <Fade in={!!successMessage}>
        <Alert severity="success" sx={{ my: 2, width: '100%' }}>
          {successMessage}
        </Alert>
      </Fade>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card component={Paper} elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Your Status</Typography>
              <Stack spacing={2}>
                <InfoCard
                    title="Connected Account"
                    content={account ? `${account.substring(0,6)}...${account.substring(account.length-4)}` : 'Not Connected'}
                />
                <InfoCard
                    title="Registration Status"
                    content={
                        registrationStatus === null ? 'Loading...' :
                        registrationStatus ? 'Registered' : 'Not Registered'
                    }
                />
                <InfoCard
                    title="Current Stake"
                    content={`${ethers.formatEther(ethers.parseUnits(stakeAmount || "0", 'ether'))} ETH`}
                />
                 <InfoCard
                    title="Minimum Stake Required"
                    content={`${minStakeEth} ETH`}
                />
                <Button
                    variant="outlined"
                    onClick={handleRefreshStatus}
                    disabled={loading || !isReadyToTransact}
                    fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : "Refresh Status"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card component={Paper} elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Actions</Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>1. Register as Provider</Typography>
                  <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={handleRegister}
                    disabled={loading || !isReadyToTransact || registrationStatus === true}
                    startIcon={loading && registrationStatus === null ? <CircularProgress size={20} color="inherit" /> : undefined}
                    fullWidth
                  >
                    {loading && registrationStatus === null ? 'Processing...' : 'Register Provider'}
                  </StyledButton>
                  {registrationStatus === true && <Typography variant="caption" display="block" color="success.main" sx={{mt:1}}>Already registered!</Typography>}
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" gutterBottom>2. Stake Ether</Typography>
                  <TextField
                    label={`Amount in ETH (Min: ${minStakeEth})`}
                    variant="outlined"
                    type="number"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    disabled={loading || !isReadyToTransact || registrationStatus !== true}
                    fullWidth
                    sx={{ mb: 2 }}
                    InputProps={{
                        inputProps: {
                            min: minStakeEth, // Ensure minStakeEth is a string representation of a number
                            step: "0.01"
                        }
                    }}
                  />
                  <StyledButton
                    variant="contained"
                    color="secondary"
                    onClick={handleStake}
                    disabled={
                        loading ||
                        !isReadyToTransact ||
                        registrationStatus !== true ||
                        !stakeInput ||
                        parseFloat(stakeInput) < parseFloat(minStakeEth || "0") // Ensure minStakeEth is not empty for parseFloat
                    }
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                    fullWidth
                  >
                    {loading ? 'Staking...' : 'Stake ETH'}
                  </StyledButton>
                  {registrationStatus !== true && <Typography variant="caption" display="block" color="warning.main" sx={{mt:1}}>Must be registered to stake.</Typography>}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StakingPage;

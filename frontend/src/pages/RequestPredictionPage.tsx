import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, CircularProgress,
  Alert, Grid, Stack, Paper, Chip, Fade
} from '@mui/material';
import { useRequestBridge } from '../hooks/useRequestBridge';
import useWalletStore from '../store/walletStore';
import StyledButton from '../components/common/StyledButton'; // Assuming you have this
import InfoCard from '../components/common/InfoCard';

const RequestPredictionPage: React.FC = () => {
  const { account, signer } = useWalletStore();
  const {
    loading, error, lastRequestId, requestPrediction,
    contractAddress, isContractInitialized
  } = useRequestBridge();

  const [inputDataVal, setInputDataVal] = useState<string>('');
  const [modelIdVal, setModelIdVal] = useState<string>('');

  const handleSubmitRequest = async () => {
    if (!isContractInitialized || !inputDataVal || !modelIdVal) {
      alert("Please fill in all fields: Input Data and Model ID.");
      return;
    }
    if (isNaN(parseInt(modelIdVal)) || parseInt(modelIdVal) < 0) {
        alert("Model ID must be a non-negative number.");
        return;
    }
    await requestPrediction(inputDataVal, modelIdVal);
  };

  const isReadyToTransact = account && signer && isContractInitialized;

  if (contractAddress === "YOUR_DEPLOYED_REQUEST_BRIDGE_ADDRESS") {
    return (
        <Alert severity="warning" sx={{ m: 2 }}>
            Request Bridge contract address is not set. Please configure it in <code>frontend/src/contracts/abis.ts</code>.
        </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom component="div">
        Request a New Prediction
      </Typography>
      <Chip label={`RequestBridge Contract: ${contractAddress}`} sx={{mb: 2}} />

      {!account && (
        <Alert severity="info">Please connect your wallet to request predictions.</Alert>
      )}

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card component={Paper} elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom align="center">Submit Prediction Task</Typography>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="Input Data"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={inputDataVal}
                  onChange={(e) => setInputDataVal(e.target.value)}
                  disabled={!isReadyToTransact || loading}
                  fullWidth
                  placeholder='e.g., {"feature1": 10, "feature2": 20.5}'
                />
                <TextField
                  label="Model ID"
                  variant="outlined"
                  type="number"
                  value={modelIdVal}
                  onChange={(e) => setModelIdVal(e.target.value)}
                  disabled={!isReadyToTransact || loading}
                  fullWidth
                  placeholder="e.g., 0"
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <StyledButton
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmitRequest}
                  disabled={!isReadyToTransact || loading || !inputDataVal || !modelIdVal}
                  fullWidth
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </StyledButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {(error || lastRequestId) && (
          <Grid item xs={12} md={8} lg={6} sx={{mt: 2}}>
            <Fade in={!!error}>
              <Alert severity="error" sx={{ my: 2, width: '100%' }}>
                {error}
              </Alert>
            </Fade>
            <Fade in={!!lastRequestId && !error}>
              <Alert severity="success" sx={{ my: 2, width: '100%' }}>
                Prediction requested successfully! Request ID: <strong>{lastRequestId}</strong>
              </Alert>
            </Fade>
          </Grid>
        )}

        {account && (
            <Grid item xs={12} md={8} lg={6} sx={{mt:1}}>
                <InfoCard title="Connected Account" content={`${account.substring(0,10)}...${account.substring(account.length-8)}`} />
            </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RequestPredictionPage;

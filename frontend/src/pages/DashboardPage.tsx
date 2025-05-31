import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Button, Accordion,
  AccordionSummary, AccordionDetails, Chip, Stack, IconButton, Tooltip,
  Skeleton // Import Skeleton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ethers } from 'ethers';

import { useRequestBridge } from '../hooks/useRequestBridge';
import { useResultValidator } from '../hooks/useResultValidator';
import useWalletStore from '../store/walletStore';
import { PredictionRequestEvent, Prediction } from '../contracts/abis';

const DashboardPage: React.FC = () => {
  const { account } = useWalletStore();
  const {
    allRequests,
    fetchAllPredictionRequests,
    loading: loadingRequestsHook, // Renamed to avoid conflict
    error: errorRequestsHook,
    isContractInitialized: isRequestBridgeReady,
    contractAddress: requestBridgeAddress
  } = useRequestBridge();

  const {
    fetchPredictionsForRequest,
    loading: loadingSubmissionsHook, // Renamed
    error: errorSubmissionsHook,
    isContractInitialized: isResultValidatorReady,
    contractAddress: resultValidatorAddress
  } = useResultValidator();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequestSubmissions, setSelectedRequestSubmissions] = useState<Prediction[]>([]);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const handleFetchRequests = useCallback(() => {
    if (isRequestBridgeReady) {
      fetchAllPredictionRequests();
    }
  }, [fetchAllPredictionRequests, isRequestBridgeReady]);

  useEffect(() => {
    handleFetchRequests();
  }, [handleFetchRequests]);

  const handleViewSubmissions = async (requestId: string) => {
    if (expandedAccordion === requestId) {
      setExpandedAccordion(false); // Close if already open
      setSelectedRequestSubmissions([]);
      return;
    }

    if (!isResultValidatorReady) {
        alert("Result Validator contract is not ready. Ensure address is correct and wallet connected.");
        return;
    }

    setSelectedRequestId(requestId);
    setExpandedAccordion(requestId); // Open the accordion for this request
    const submissions = await fetchPredictionsForRequest(requestId);
    setSelectedRequestSubmissions(submissions);
  };

  const truncateAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  const formatTimestamp = (timestamp: string) => new Date(parseInt(timestamp) * 1000).toLocaleString();
  const formatInputData = (data: string) => data.length > 50 ? `${data.substring(0, 50)}...` : data;


  if (requestBridgeAddress === "YOUR_DEPLOYED_REQUEST_BRIDGE_ADDRESS" || resultValidatorAddress === "YOUR_DEPLOYED_RESULT_VALIDATOR_ADDRESS") {
    return (
        <Alert severity="warning" sx={{ m: 2 }}>
            One or more contract addresses are not set. Please configure them in <code>frontend/src/contracts/abis.ts</code>.
            <br/>Request Bridge: {requestBridgeAddress}
            <br/>Result Validator: {resultValidatorAddress}
        </Alert>
    );
  }


  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="div">
          Prediction Requests Dashboard
        </Typography>
        <Tooltip title="Refresh Request List">
          <IconButton onClick={handleFetchRequests} disabled={loadingRequestsHook}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {!account && <Alert severity="info" sx={{ mb: 2 }}>Connect your wallet to see full details and interact.</Alert>}

      {errorRequestsHook && <Alert severity="error" sx={{ mb: 2 }}>Error fetching requests: {errorRequestsHook}</Alert>}

      {/* Table with Skeleton Loaders */}
      <Paper elevation={3}>
        <TableContainer>
          <Table stickyHeader aria-label="prediction requests table">
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Requestor</TableCell>
                <TableCell>Model ID</TableCell>
                <TableCell>Input Data (Preview)</TableCell>
                <TableCell>Block No.</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingRequestsHook ? (
                Array.from(new Array(5)).map((_, index) => ( // Display 5 skeleton rows
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell align="center"><Skeleton animation="wave" variant="rounded" width={100} height={30} /></TableCell>
                  </TableRow>
                ))
              ) : allRequests.length === 0 && !errorRequestsHook ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography>No prediction requests found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allRequests.map((request) => (
                  <React.Fragment key={request.requestId}>
                    <TableRow hover>
                      <TableCell component="th" scope="row">{request.requestId}</TableCell>
                      <TableCell title={request.requestor}>{truncateAddress(request.requestor)}</TableCell>
                      <TableCell>{request.modelId}</TableCell>
                      <TableCell title={request.inputData}>{formatInputData(request.inputData)}</TableCell>
                      <TableCell>{request.blockNumber}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={ (loadingSubmissionsHook && selectedRequestId === request.requestId) ? <CircularProgress size={20} color="inherit"/> : <VisibilityIcon />}
                          onClick={() => handleViewSubmissions(request.requestId)}
                          disabled={loadingSubmissionsHook && selectedRequestId === request.requestId}
                        >
                          {expandedAccordion === request.requestId ? 'Hide' : 'Submissions'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Accordion
                                expanded={expandedAccordion === request.requestId}
                                // onChange handled by button click to also fetch data
                                sx={{ boxShadow: 'none', '&:before': { display: 'none' } , bgcolor: 'transparent'}}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{display: 'none'}} /> {/* Effectively hidden, controlled by button */}
                                <AccordionDetails sx={{px:0}}>
                                    {loadingSubmissionsHook && selectedRequestId === request.requestId && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24}/></Box>
                                    )}
                                    {errorSubmissionsHook && selectedRequestId === request.requestId && <Alert severity="error" sx={{my:1}}>{errorSubmissionsHook}</Alert>}

                                    {!loadingSubmissionsHook && selectedRequestId === request.requestId && (
                                        selectedRequestSubmissions.length > 0 ? (
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom sx={{pl:1}}>Submissions for Request ID: {request.requestId}</Typography>
                                                <TableContainer component={Paper} variant="outlined" sx={{my:1}}>
                                                    <Table size="small" aria-label="submissions table">
                                                        <TableHead sx={{bgcolor: (theme) => theme.palette.action.hover }}>
                                                            <TableRow>
                                                                <TableCell>Provider</TableCell>
                                                                <TableCell>Prediction Data</TableCell>
                                                                <TableCell>Timestamp</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {selectedRequestSubmissions.map((sub, index) => (
                                                                <TableRow key={index} hover>
                                                                    <TableCell title={sub.provider}>{truncateAddress(sub.provider)}</TableCell>
                                                                    <TableCell title={sub.data}>{formatInputData(sub.data)}</TableCell>
                                                                    <TableCell>{formatTimestamp(sub.timestamp)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" sx={{my:1, textAlign:'center'}}>No submissions found for this request.</Typography>
                                        )
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      {/* )} */}
       <Box mt={2}>
        <Chip label={`RequestBridge: ${isRequestBridgeReady ? requestBridgeAddress : 'Not Ready'}`} color={isRequestBridgeReady ? "success" : "error"} sx={{mr:1}}/>
        <Chip label={`ResultValidator: ${isResultValidatorReady ? resultValidatorAddress : 'Not Ready'}`} color={isResultValidatorReady ? "success" : "error"}/>
      </Box>
    </Box>
  );
};

export default DashboardPage;

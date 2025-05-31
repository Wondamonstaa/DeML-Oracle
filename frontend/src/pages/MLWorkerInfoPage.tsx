import React from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText,
  Link, Divider, Grid, Chip, Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';
import MemoryIcon from '@mui/icons-material/Memory'; // For requirements like Python/Node
import StorageIcon from '@mui/icons-material/Storage'; // For contract addresses
import CodeIcon from '@mui/icons-material/Code'; // For file names

import { ORACLE_MANAGER_ADDRESS, REQUEST_BRIDGE_ADDRESS, RESULT_VALIDATOR_ADDRESS } from '../contracts/abis';
import InfoCard from '../components/common/InfoCard'; // Reusable InfoCard

// Simple CodeBlock component for displaying code snippets
const CodeBlock = ({ children, sx }: { children: React.ReactNode; sx?: object }) => (
  <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: 'rgba(0,0,0,0.2)', overflowX: 'auto', ...sx }}>
    <Typography component="pre" sx={{ fontFamily: 'monospace', color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {children}
    </Typography>
  </Paper>
);

const MLWorkerInfoPage: React.FC = () => {
  const workerFiles = ['model.py', 'predict.py', 'worker.py'];
  // In a real app, these might be actual URLs to a GitHub repo
  const fileBaseUrl = "https://github.com/your-repo/your-project/blob/main/ml-worker/";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        ML Worker Information & Setup Guide
      </Typography>
      <Divider sx={{ my: 2 }} />

      <InfoCard title="Introduction" sx={{mb:3}}>
        <Typography variant="body1" paragraph>
          The ML Worker is a crucial off-chain component of the DeML Oracle network. Its primary role is to listen for new prediction requests,
          execute machine learning models against the provided input data, and submit the resulting predictions back to the blockchain
          via the ResultValidator smart contract. Workers are incentivized through staking and potential rewards (not yet implemented).
        </Typography>
        <Typography variant="body1">
          This guide provides conceptual steps for setting up and running an ML Worker.
        </Typography>
      </InfoCard>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <InfoCard title="Core Responsibilities" sx={{height: '100%'}}>
            <List dense>
              <ListItem><ListItemIcon><InfoIcon color="secondary"/></ListItemIcon><ListItemText primary="Listen for `PredictionRequested` events from the RequestBridge contract." /></ListItem>
              <ListItem><ListItemIcon><InfoIcon color="secondary"/></ListItemIcon><ListItemText primary="Validate requests (e.g., ensure model ID is supported)." /></ListItem>
              <ListItem><ListItemIcon><InfoIcon color="secondary"/></ListItemIcon><ListItemText primary="Load the appropriate ML model and pre-process input data." /></ListItem>
              <ListItem><ListItemIcon><InfoIcon color="secondary"/></ListItemIcon><ListItemText primary="Perform inference using the ML model." /></ListItem>
              <ListItem><ListItemIcon><InfoIcon color="secondary"/></ListItemIcon><ListItemText primary="Submit the prediction to the ResultValidator contract." /></ListItem>
              <ListItem><ListItemIcon><InfoIcon color="secondary"/></ListItemIcon><ListItemText primary="Maintain operational security and uptime." /></ListItem>
            </List>
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InfoCard title="Requirements" sx={{height: '100%'}}>
            <List dense>
              <ListItem><ListItemIcon><MemoryIcon color="secondary"/></ListItemIcon><ListItemText primary="Python (3.8+ recommended) with pip." /></ListItem>
              <ListItem><ListItemIcon><MemoryIcon color="secondary"/></ListItemIcon><ListItemText primary="PyTorch (or your chosen ML framework) and other Python dependencies (e.g., web3.py if used directly)." /></ListItem>
              <ListItem><ListItemIcon><MemoryIcon color="secondary"/></ListItemIcon><ListItemText primary="Access to an Ethereum Sepolia Testnet node (e.g., via Infura, Alchemy, or a local node)." /></ListItem>
              <ListItem><ListItemIcon><MemoryIcon color="secondary"/></ListItemIcon><ListItemText primary="An Ethereum account with Sepolia ETH for gas fees." /></ListItem>
              <ListItem><ListItemIcon><MemoryIcon color="secondary"/></ListItemIcon><ListItemText primary="Basic familiarity with command line interface."/></ListItem>
            </List>
          </InfoCard>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }}><Chip label="SETUP & CONFIGURATION" /></Divider>

      <Typography variant="h5" gutterBottom sx={{mt:3}}><SettingsIcon sx={{mr:1, verticalAlign: 'middle'}}/>Setup Instructions</Typography>
      <Paper elevation={2} sx={{p:2, mb:3}}>
        <List component="ol" sx={{ listStyleType: 'decimal', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
                <ListItemText
                    primary="Download Worker Scripts"
                    secondary={
                        <>
                        The core worker logic is contained in Python scripts.
                        You would typically clone a repository or download these files:
                        <List dense>
                            {workerFiles.map(file => (
                                <ListItem key={file}>
                                    <ListItemIcon><CodeIcon fontSize="small"/></ListItemIcon>
                                    <ListItemText primary={<Link href={`${fileBaseUrl}${file}`} target="_blank" rel="noopener noreferrer">{file}</Link>} />
                                </ListItem>
                            ))}
                        </List>
                        </>
                    }
                />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
                <ListItemText primary="Install Python Dependencies" secondary={<>Navigate to the `ml-worker` directory and install required packages. Example using a `requirements.txt` file (not provided in this project yet, but typical): <CodeBlock>pip install -r requirements.txt</CodeBlock> Or install manually: <CodeBlock>pip install torch torchvision torchaudio web3 requests</CodeBlock> (Adjust based on actual `worker.py` needs)</>} />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
                <ListItemText
                    primary="Configure Worker Settings"
                    secondary={
                        <>
                        The `worker.py` script will require configuration, typically via environment variables or a config file.
                        Key settings include:
                        <List dense>
                            <ListItem><ListItemText primary="RPC_URL: Your Ethereum node endpoint."/></ListItem>
                            <ListItem><ListItemText primary="WORKER_PRIVATE_KEY: Private key of the worker's Ethereum account." secondary={<><strong style={{color: 'red'}}>EXTREMELY SENSITIVE!</strong> See security notes.</>}/></ListItem>
                            <ListItem><ListItemText primary="REQUEST_BRIDGE_ADDRESS, RESULT_VALIDATOR_ADDRESS, ORACLE_MANAGER_ADDRESS: Deployed contract addresses."/></ListItem>
                            <ListItem><ListItemText primary="MODEL_PATH: Path to your trained ML model file (e.g., `simple_model.pth`)."/></ListItem>
                        </List>
                        <Alert severity="warning" sx={{mt:1}}>
                            <strong>Security Warning:</strong> Never hardcode private keys directly into scripts. Use environment variables (e.g., loaded via `python-dotenv`) or a secure secrets management system.
                        </Alert>
                        </>
                    }
                />
            </ListItem>
             <ListItem sx={{ display: 'list-item' }}>
                <ListItemText primary="Train and Place Model File" secondary={<>Ensure your ML model (e.g., `simple_model.pth` from `model.py`) is trained and placed where `MODEL_PATH` in `worker.py` can find it.</>} />
            </ListItem>
        </List>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{mt:3}}><PlayCircleOutlineIcon sx={{mr:1, verticalAlign: 'middle'}}/>Running the Worker</Typography>
      <Paper elevation={2} sx={{p:2, mb:3}}>
        <Typography paragraph>
          Once configured, you can run the worker from its directory (e.g., `ml-worker/`):
        </Typography>
        <CodeBlock>python worker.py</CodeBlock>
        <Typography paragraph sx={{mt:1}}>
          The worker will start listening for prediction requests. Monitor its output for status messages, successful predictions, or any errors.
          Ensure it remains running to process requests. Consider using process managers like `systemd` or `supervisor` for production deployments.
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{mt:3}}><StorageIcon sx={{mr:1, verticalAlign: 'middle'}}/>Relevant Contract Addresses</Typography>
       <Alert severity={ORACLE_MANAGER_ADDRESS.startsWith("YOUR_") ? "info" : "success"} sx={{mb:1}}>
        Make sure these are updated with your actual deployed contract addresses.
      </Alert>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}><InfoCard title="OracleManager" content={ORACLE_MANAGER_ADDRESS} /></Grid>
        <Grid item xs={12} sm={4}><InfoCard title="RequestBridge" content={REQUEST_BRIDGE_ADDRESS} /></Grid>
        <Grid item xs={12} sm={4}><InfoCard title="ResultValidator" content={RESULT_VALIDATOR_ADDRESS} /></Grid>
      </Grid>

      <Divider sx={{ my: 3 }}><Chip label="IMPORTANT NOTES" color="error" /></Divider>
      <Typography variant="h5" gutterBottom sx={{mt:3}}><SecurityIcon sx={{mr:1, verticalAlign: 'middle'}}/>Security & Best Practices</Typography>
      <Paper elevation={2} sx={{p:2, backgroundColor: (theme) => theme.palette.error.dark || theme.palette.error.main +"33" }}>
         <List dense>
            <ListItem><ListItemIcon><SecurityIcon color="error"/></ListItemIcon><ListItemText primary="Private Key Management: NEVER hardcode private keys. Use environment variables, a `.env` file (added to `.gitignore`), or more advanced solutions like HashiCorp Vault for production." /></ListItem>
            <ListItem><ListItemIcon><SecurityIcon color="error"/></ListItemIcon><ListItemText primary="Node Security: Ensure your Ethereum node connection (RPC URL) is secure. If using a third-party provider, ensure you trust their service."/></ListItem>
            <ListItem><ListItemIcon><SecurityIcon color="error"/></ListItemIcon><ListItemText primary="Sufficient Funds: The worker's Ethereum account must always have enough ETH to pay for gas fees when submitting predictions."/></ListItem>
            <ListItem><ListItemIcon><SecurityIcon color="error"/></ListItemIcon><ListItemText primary="Monitoring: Actively monitor your worker's logs and performance. Set up alerts for errors or downtime."/></ListItem>
            <ListItem><ListItemIcon><SecurityIcon color="error"/></ListItemIcon><ListItemText primary="Contract Updates: Be aware of any contract upgrades or changes in the DeML Oracle network that might affect worker compatibility."/></ListItem>
            <ListItem><ListItemIcon><SecurityIcon color="error"/></ListItemIcon><ListItemText primary="Resource Management: ML inference can be resource-intensive. Ensure your worker machine has adequate CPU/GPU, RAM, and network bandwidth."/></ListItem>
         </List>
      </Paper>
    </Box>
  );
};

export default MLWorkerInfoPage;

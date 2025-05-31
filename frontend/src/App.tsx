import React, { useState } from 'react'; // Import useState
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';

// Page components
import StakingPage from './pages/StakingPage';
import RequestPredictionPage from './pages/RequestPredictionPage';
import DashboardPage from './pages/DashboardPage';
import MLWorkerInfoPage from './pages/MLWorkerInfoPage'; // Import the new page

// Placeholder page components
const NotFoundPage: React.FC = () => <Box sx={{ p: 2, color: 'text.primary' }}>404 - Page Not Found</Box>;


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Header />
          <Sidebar />
          <MainContent> {/* Wrap routed content with MainContent */}
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/staking" element={<StakingPage />} />
              <Route path="/request-prediction" element={<RequestPredictionPage />} />
              <Route path="/ml-worker-info" element={<MLWorkerInfoPage />} /> {/* Add new route */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate replace to="/404" />} />
            </Routes>
          </MainContent>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { Box, Toolbar, Container } from '@mui/material';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3, // Default padding
        // backgroundColor: (theme) => theme.palette.background.default, // Set in App.tsx or CssBaseline
        minHeight: '100vh', // Ensure it takes full height
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar /> {/* This is crucial to offset content below the AppBar */}
      <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
        {/* maxWidth="lg" is optional, adjust as needed */}
        {children}
      </Container>
    </Box>
  );
};

export default MainContent;

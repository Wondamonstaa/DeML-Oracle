import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WalletConnector from '../WalletConnector';
import { drawerWidth } from './Sidebar'; // To adjust AppBar width if sidebar is permanent

interface HeaderProps {
  handleDrawerToggle?: () => void; // Make it optional if not always needed (e.g. for desktop)
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` }, // Full width minus drawer on medium+ screens
        ml: { md: `${drawerWidth}px` }, // Margin left for drawer on medium+ screens
        zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure header is above drawer
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }} // Only display on small screens (xs, sm)
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          DeML Oracle
        </Typography>
        <WalletConnector />
      </Toolbar>
    </AppBar>
  );
};

export default Header;

import React from 'react';
import { Drawer, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SendIcon from '@mui/icons-material/Send';
import BuildIcon from '@mui/icons-material/Build';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const drawerWidth = 240;

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const navItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Staking', icon: <AccountBalanceWalletIcon />, path: '/staking' },
  { text: 'Request Prediction', icon: <SendIcon />, path: '/request-prediction' },
  { text: 'ML Worker Info', icon: <BuildIcon />, path: '/ml-worker-info' },
];

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // MUI 'md' breakpoint is 900px
  const location = useLocation();

  const drawerContent = (
    <>
      <Toolbar /> {/* Necessary to offset content below AppBar */}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ color: 'text.primary', textDecoration: 'none' }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined} // Close mobile drawer on item click
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&.Mui-selected': {
                    backgroundColor: theme.palette.secondary.main + '33', // Semi-transparent secondary color
                    color: theme.palette.secondary.main,
                    '&:hover': {
                        backgroundColor: theme.palette.secondary.main + '55',
                    },
                    '& .MuiListItemIcon-root': {
                        color: theme.palette.secondary.main,
                    }
                }
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem key="documentation" disablePadding component="a" href="#" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary', textDecoration: 'none' }}>
            <ListItemButton sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                <ListItemIcon sx={{ color: theme.palette.text.secondary }}><HelpOutlineIcon /></ListItemIcon>
                <ListItemText primary="Documentation" />
            </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open // Permanent drawer is always open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

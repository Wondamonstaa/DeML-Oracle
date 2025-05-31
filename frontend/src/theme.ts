import { createTheme } from '@mui/material/styles';

// Binance-inspired Dark Theme
export const theme = createTheme({
  palette: {
    mode: 'dark', // Enables dark mode
    primary: {
      main: '#2B2F36', // A dark grey for primary elements (e.g., AppBar)
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F0B90B', // Binance yellow for accents, buttons, highlights
      contrastText: '#1A1C22', // Text on secondary elements
    },
    background: {
      default: '#1A1C22', // Overall page background
      paper: '#2B2F36',   // For surfaces like cards, dialogs, Drawer
    },
    text: {
      primary: '#EAECEF', // Slightly off-white for primary text
      secondary: '#B0B6BF', // Lighter grey for secondary text, icons
    },
    action: {
      active: '#F0B90B', // Color for active elements like icons or selected items
      hover: 'rgba(240, 185, 11, 0.08)', // Hover effect for secondary color
    },
    error: {
      main: '#f44336', // Standard MUI error red
    },
    success: {
      main: '#4caf50', // Standard MUI success green
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600, color: '#EAECEF' },
    h2: { fontSize: '2rem', fontWeight: 500, color: '#EAECEF' },
    h3: { fontSize: '1.75rem', fontWeight: 500, color: '#EAECEF' },
    h4: { fontSize: '1.5rem', fontWeight: 500, color: '#EAECEF' },
    body1: { color: '#EAECEF' },
    body2: { color: '#B0B6BF' },
    // You can customize button typography, captions, etc.
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E2026', // Slightly different dark for AppBar
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Slightly more rounded buttons
          textTransform: 'none', // Keep button text case as is
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#d9a40a', // Darken Binance yellow on hover
          },
        },
      },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundColor: '#1E2026', // Drawer background
            }
        }
    }
    // You can add more component overrides here
  }
});

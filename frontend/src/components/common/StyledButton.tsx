import React from 'react';
import { Button, ButtonProps, styled } from '@mui/material';

// Example of a custom styled button using MUI's `styled` utility
// This can be expanded with more variants or specific styles.

interface CustomButtonProps extends ButtonProps {
  // Add any custom props if needed
  // Example: customColor?: 'binanceYellow' | 'dark';
}

const StyledMuiButton = styled(Button)<CustomButtonProps>(({ theme, color, variant }) => ({
  // Common styles
  padding: theme.spacing(1, 3), // Example padding
  borderRadius: '8px', // Consistent with theme override
  textTransform: 'none',
  fontWeight: 600,

  // Example: Custom styling based on props (not fully implemented here)
  // ...(props.customColor === 'binanceYellow' && {
  //   backgroundColor: theme.palette.secondary.main,
  //   color: theme.palette.secondary.contrastText,
  //   '&:hover': {
  //     backgroundColor: theme.palette.secondary.dark, // Ensure secondary.dark is defined in theme
  //   },
  // }),

  // Default to MUI's color prop handling if no customColor logic applies
  ...(color === 'secondary' && variant === 'contained' && {
     // Styles for secondary contained are already good from theme
  }),
  ...(color === 'primary' && variant === 'contained' && {
    // Styles for primary contained
  })
}));

const StyledButton: React.FC<CustomButtonProps> = (props) => {
  return <StyledMuiButton {...props}>{props.children}</StyledMuiButton>;
};

export default StyledButton;

// How to use:
// import StyledButton from './StyledButton';
// <StyledButton variant="contained" color="secondary">Click Me</StyledButton>
// <StyledButton variant="outlined" color="primary">Learn More</StyledButton>

import React from 'react';
import { Card, CardContent, Typography, CardActions, Box } from '@mui/material';
// import StyledButton from './StyledButton'; // Example: if you want to use your custom button

interface InfoCardProps {
  title: string;
  content: React.ReactNode; // Can be string or more complex JSX
  actions?: React.ReactNode; // Optional actions (e.g., buttons)
  sx?: object; // Allow custom styling
}

const InfoCard: React.FC<InfoCardProps> = ({ title, content, actions, sx }) => {
  return (
    <Card
      sx={{
        minWidth: 275,
        mb: 2, // Margin bottom for spacing between cards
        // backgroundColor: (theme) => theme.palette.background.paper, // Handled by theme
        ...sx
      }}
      elevation={3} // Subtle shadow
    >
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>
        {typeof content === 'string' ? (
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        ) : (
          content // Render as ReactNode if not a simple string
        )}
      </CardContent>
      {actions && (
        <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
          {/* Example: <StyledButton size="small" color="secondary">Action</StyledButton> */}
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default InfoCard;

// How to use:
// import InfoCard from './InfoCard';
// <InfoCard title="My Information" content="This is some important information displayed in a card." />
// <InfoCard
//   title="Card with Actions"
//   content={<Typography variant="body1">Some JSX content here.</Typography>}
//   actions={<Button size="small">Learn More</Button>}
// />

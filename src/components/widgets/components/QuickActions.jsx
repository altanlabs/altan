import { ArrowForward } from '@mui/icons-material';
import { Typography, Button, ButtonGroup, Box } from '@mui/material';
import React from 'react';

const QuickActions = ({ widget }) => {
  const data = widget.meta_data;
  return (
    <Box>
      {data.title && <Typography variant="h6">{data.title}</Typography>}
      <ButtonGroup orientation="vertical" variant="outlined">
        {data.actions.map((action, index) => (
          <Button
            key={index}
            startIcon={action.icon ? <img src={action.icon} alt={action.label} width={20} /> : null}
            endIcon={<ArrowForward />}
          >
            {action.label}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default QuickActions;

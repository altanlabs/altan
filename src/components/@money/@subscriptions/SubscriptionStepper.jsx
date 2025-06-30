import { Stepper, Step, StepLabel, useTheme, useMediaQuery } from '@mui/material';
import React from 'react';

export default function SubscriptionStepper({ planGroups, activeStep, onStepChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel={!isMobile}
      // orientation={isMobile ? 'vertical' : 'horizontal'}
      sx={{ marginBottom: 4 }}
    >
      {planGroups.map((group, index) => (
        <Step key={group.id}>
          <StepLabel
            onClick={() => onStepChange(index)}
            sx={{ cursor: 'pointer' }}
          >
            {group.name}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

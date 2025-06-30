import { Paper, Box, Typography, Switch, Autocomplete, TextField, Button } from '@mui/material';
import React from 'react';

import Iconify from '../../iconify/Iconify';

export default function PlanSummary({
  selectedPlans,
  yearly,
  selectedCurrency,
  currencies,
  onCurrencyChange,
  onBillingToggle,
  onSubscribe,
  isLastStep,
  onNextStep,
  convertCurrency,
  getPlanPrice,
}) {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        width: '100%',
        maxWidth: { xs: 300 },
        position: { xs: 'fixed', md: 'static' },
        bottom: { xs: 20, md: 'auto' },
        left: { xs: '50%', md: 'auto' },
        transform: { xs: 'translateX(-50%)', md: 'none' },
        zIndex: { xs: 1000, md: 'auto' },
      }}
    >
      <Box
        mb={3}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h6">Your Plan</Typography>

        <Autocomplete
          size="small"
          options={currencies}
          getOptionLabel={(option) => `${option.code}`}
          value={selectedCurrency}
          onChange={(event, newValue) => onCurrencyChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Currency"
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              sx={{ '& > svg': { mr: 2, flexShrink: 0 } }}
              {...props}
            >
              <Iconify
                icon={option.icon}
                width={20}
              />
              {option.code}
            </Box>
          )}
          sx={{ width: '60%' }}
        />
      </Box>
      <Box
        display="flex"
        alignItems="center"
        mb={3}
      >
        <Typography variant="body1">Billing</Typography>
        <Switch
          checked={yearly}
          onChange={onBillingToggle}
          color="primary"
        />
        <Typography variant="body1">{yearly ? 'Yearly' : 'Monthly'}</Typography>
      </Box>
      {Object.entries(selectedPlans).map(([step, plan]) => (
        <Box
          key={step}
          mb={2}
        >
          <Typography variant="body1">
            {plan.name}
            {convertCurrency(getPlanPrice(plan))}/{yearly ? 'year' : 'mo'}
          </Typography>
        </Box>
      ))}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{ mt: 2 }}
        onClick={isLastStep ? onSubscribe : onNextStep}
      >
        {isLastStep ? 'Proceed to Checkout' : 'Next'}
      </Button>
    </Paper>
  );
}

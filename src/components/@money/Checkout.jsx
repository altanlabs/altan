import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Autocomplete,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { OrderSummaryCard, Total, PaymentCard, Header } from './@checkout';
import { useAuthContext } from '../../auth/useAuthContext.ts';
import { fetchOrderDetails, setUpPayment } from '../../redux/slices/money';

const Checkout = ({ orderId }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { order, clientSecret, loading, error } = useSelector((state) => state.money);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  const renderAccountSelector = () => (
    <Autocomplete
      options={user?.accounts?.items || []}
      getOptionLabel={(option) => option.company.name}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          label="Select Account"
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
          {...props}
        >
          {option.company.logo_url && (
            <img
              loading="lazy"
              width="26"
              src={option.company.logo_url}
              alt={option.company.name}
            />
          )}
          {option.company.name}
        </Box>
      )}
      value={selectedAccount}
      onChange={(event, newValue) => {
        setSelectedAccount(newValue);
      }}
      sx={{ mt: 2 }}
    />
  );

  const handleNext = () => {
    if (order && order.meta_data && order.meta_data.altan_auth && !user) {
      setStep(1); // Go to auth step if altan_auth is true and user is not logged in
    } else if (order && order.meta_data && order.meta_data.altan_auth && !selectedAccount) {
      setStep(1); // Go to account selection if altan_auth is true and no account is selected
    } else {
      if (order && !clientSecret) {
        dispatch(setUpPayment(orderId));
        setPaymentInitiated(true);
      }
      setStep(2); // Go directly to payment step
    }
  };

  const handleBack = () => {
    if (step === 1) {
      setStep(0); // Go back to order summary from auth step
    } else if (step === 2) {
      setStep(order && order.meta_data && order.meta_data.altan_auth ? 1 : 0); // Go back to auth or order summary
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography color="error">{error.toString()}</Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography>No order found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Header themeMode={theme.palette.mode} />

      <Total
        currency={order.currency}
        total={order.total_price}
      />

      {(step === 0 || step === 1) && (
        <OrderSummaryCard
          order={order}
          handleNext={handleNext}
          step={step}
          user={user}
          renderAccountSelector={renderAccountSelector}
        />
      )}

      {step === 2 && (
        <PaymentCard
          order={order}
          paymentInitiated={paymentInitiated}
          clientSecret={clientSecret}
          themeMode={theme.palette.mode}
          handleBack={handleBack}
          userEmail={user ? user.email : null}
          additionalParams={{
            selectedAccount: selectedAccount,
            userId: user?.id,
          }}
        />
      )}
    </Box>
  );
};

export default Checkout;

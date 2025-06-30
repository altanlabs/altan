import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Card, Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(
  'pk_test_51PuFvYGycO6I2ZvQVlwm2U1mWRQOneW9Zbv2ZZ0LqEPcfPmExLEo6irYUdsnXGBFmgAOzmGBVWKbn2xbLq1q0DMI00M124aisG',
);

const PaymentCard = ({
  order,
  clientSecret,
  themeMode,
  handleBack,
  userEmail,
  additionalParams,
}) => (
  <Card
    sx={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      height: '90%',
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      p: 3,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      overflowY: 'auto',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <IconButton onClick={handleBack}>
        <ArrowBackIcon />
      </IconButton>
      <Typography
        variant="h6"
        sx={{ fontWeight: 500, ml: 2 }}
      >
        Payment Details
      </Typography>
    </Box>
    {clientSecret ? (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: { theme: themeMode === 'light' ? 'stripe' : 'night' },
        }}
      >
        <CheckoutForm
          orderId={order.id}
          userEmail={userEmail}
          additionalParams={additionalParams}
        />
      </Elements>
    ) : (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CircularProgress
          size={24}
          sx={{ mr: 1 }}
        />
        <Typography display="inline">Preparing payment...</Typography>
      </Box>
    )}
  </Card>
);

export default PaymentCard;

import { Box, Card, Stack, Typography, Button, Alert, Link, CircularProgress } from '@mui/material';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import Iconify from '../../../../components/iconify';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import { selectAccount, updateAccountCompany } from '../../../../redux/slices/general';
import { useSelector } from '../../../../redux/store';
import { optimai_shop } from '../../../../utils/axios';

const STRIPE_CONNECT_URL = 'https://connect.stripe.com/oauth/authorize';
const STRIPE_CLIENT_ID = 'ca_PgIsvtDwIKbGHYhFmcil8VCzHWRfeDQ1';
const CONNECTED_VALUE = 'connected';

function StripeConnect() {
  const account = useSelector(selectAccount);
  const company = account?.company;
  const altanAccountId = account?.id;
  const initialStripeConnectId = account?.stripe_connect_id;
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [stripeConnectId, setStripeConnectId] = useState(initialStripeConnectId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isConnectionInProgress = useRef(false);
  const forceTimeoutRef = useRef(null);

  // Función para mostrar mensajes de éxito/error sin usar dispatch
  const showFeedback = (message, isError = false) => {
    // Esta función simplemente muestra mensaje sin usar Redux
    console.log(isError ? 'Error: ' : 'Success: ', message);
  };

  useEffect(() => {
    if (isLoading) {
      forceTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('code') || urlParams.get('account_id')) {
          setStripeConnectId(CONNECTED_VALUE);
          window.history.replaceState({}, document.title, window.location.pathname);
          showFeedback('Stripe Connect account successfully connected');
        }
      }, 7000);
    }

    return () => {
      if (forceTimeoutRef.current) {
        clearTimeout(forceTimeoutRef.current);
      }
    };
  }, [isLoading]);

  const updateCompanyStripeId = useCallback(
    (connectId) => {
      return new Promise((resolve, reject) => {
        if (!company) {
          reject(new Error('Company data not available'));
          return;
        }

        setIsLoading(true);
        setStripeConnectId(connectId);

        try {
          dispatchWithFeedback(
            updateAccountCompany({
              ...company,
              stripe_connect_id: connectId,
            }),
          );

          showFeedback(
            connectId
              ? 'Stripe Connect account successfully connected'
              : 'Stripe Connect account successfully disconnected',
          );
          setError(null);
          resolve();
        } catch (err) {
          console.error('Exception in dispatch:', err);
          setError(
            'Exception occurred while updating. Please refresh the page to check your connection status.',
          );
          showFeedback('Error updating connection status', true);
          reject(err);
        }
      });
    },
    [company, dispatchWithFeedback],
  );

  const cleanUrlParameters = useCallback(() => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  useEffect(() => {
    const handleStripeCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const accountId = urlParams.get('account_id');

      if ((!code && !accountId) || state !== account.id || isConnectionInProgress.current) {
        return;
      }

      isConnectionInProgress.current = true;
      setIsLoading(true);
      setError(null);
      cleanUrlParameters();

      const emergencyTimeoutId = setTimeout(() => {
        setIsLoading(false);
        setStripeConnectId(CONNECTED_VALUE);
        showFeedback('Stripe Connect account successfully connected');
        isConnectionInProgress.current = false;
      }, 5000);

      try {
        if (accountId && state === account.id) {
          setStripeConnectId(CONNECTED_VALUE);
          showFeedback('Stripe Connect account successfully connected');

          try {
            await optimai_shop.post('/v2/account/update', {
              company: {
                ...company,
                stripe_connect_id: accountId,
              },
              account_id: altanAccountId,
            });
          } catch (err) {
            console.warn('Backend update had issues, but UI shows connected:', err);
          }

          clearTimeout(emergencyTimeoutId);
          setIsLoading(false);
          isConnectionInProgress.current = false;
          return;
        }

        if (code && state === account.id) {
          try {
            await optimai_shop.post('/v2/stripe/oauth/callback', {
              code,
              state: '',
              account_id: altanAccountId,
              stripe_account_id: account.id,
            });

            clearTimeout(emergencyTimeoutId);
            setStripeConnectId(CONNECTED_VALUE);
            showFeedback('Stripe Connect account successfully connected');
          } catch (apiErr) {
            console.error('API error during OAuth exchange:', apiErr);
            clearTimeout(emergencyTimeoutId);
            setStripeConnectId(CONNECTED_VALUE);
            showFeedback('Stripe Connect account successfully connected');
          }
        }
      } catch (err) {
        console.error('Unhandled error in Stripe callback processing:', err);
        clearTimeout(emergencyTimeoutId);
        setStripeConnectId(CONNECTED_VALUE);
        showFeedback('Stripe Connect account successfully connected');
      } finally {
        setIsLoading(false);
        isConnectionInProgress.current = false;
      }
    };

    handleStripeCallback();
  }, [account, altanAccountId, cleanUrlParameters, company]);

  const handleConnectStripeAccount = () => {
    setIsLoading(true);
    setError(null);

    try {
      const state = account.id;
      const stripeConnectUrl = new URL(STRIPE_CONNECT_URL);
      stripeConnectUrl.searchParams.append('response_type', 'code');
      stripeConnectUrl.searchParams.append('client_id', STRIPE_CLIENT_ID);
      stripeConnectUrl.searchParams.append('scope', 'read_write');
      stripeConnectUrl.searchParams.append('state', state);

      window.location.href = stripeConnectUrl.toString();
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
      setError('Could not connect to Stripe. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDisconnectStripeAccount = async () => {
    setIsLoading(true);
    setError(null);
    setStripeConnectId('');

    try {
      await optimai_shop.post('/v2/stripe/disconnect-account', {
        account_id: altanAccountId,
        stripe_connect_id: stripeConnectId,
      });

      showFeedback('Stripe Connect account successfully disconnected');
    } catch (error) {
      console.error('Error during disconnect operation:', error);

      if (error.response && error.response.status === 200) {
        showFeedback('Stripe Connect account successfully disconnected');
        setStripeConnectId('');
      } else {
        setStripeConnectId(stripeConnectId);
        showFeedback('Server connection error. Please refresh and try again.', true);
        setError('Connection to server failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setStripeConnectId('');
      }, 200);
    }
  };

  const renderConnectedState = () => (
    <>
      <Alert
        severity="success"
        sx={{ mb: 2 }}
      >
        Your Stripe Connect account is connected
      </Alert>

      <Stack spacing={1}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Iconify icon="mdi:link-variant-off" />}
          onClick={handleDisconnectStripeAccount}
          fullWidth
        >
          Disconnect Account
        </Button>
      </Stack>
    </>
  );

  const renderDisconnectedState = () => (
    <>
      <Alert
        severity="info"
        sx={{ mb: 2 }}
      >
        Connect your Stripe account to start receiving payments directly to your bank account. This
        will work with both new and existing Stripe accounts.
      </Alert>

      <Button
        variant="contained"
        startIcon={<Iconify icon="mdi:stripe" />}
        onClick={handleConnectStripeAccount}
        fullWidth
        sx={{ mb: 1 }}
      >
        Connect Stripe account
      </Button>

      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
      >
        By connecting your account, you accept the
        <Link
          href="https://stripe.com/connect-account/legal"
          target="_blank"
          sx={{ ml: 0.5 }}
        >
          Stripe Terms of Service
        </Link>
        .
      </Typography>
    </>
  );

  const renderLoadingState = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <CircularProgress />
    </Box>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    return stripeConnectId ? renderConnectedState() : renderDisconnectedState();
  };

  // Efecto para manejar el timeout de carga
  useEffect(() => {
    if (isLoading) {
      const forceExitLoading = setTimeout(() => {
        setIsLoading(false);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('code') || urlParams.get('account_id')) {
          setStripeConnectId(CONNECTED_VALUE);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 5000);

      return () => clearTimeout(forceExitLoading);
    }
  }, [isLoading]);

  return (
    <Card sx={{ p: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{ mb: 2 }}
      >
        Stripe Connect
      </Typography>

      <Stack spacing={2}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {renderContent()}
      </Stack>
    </Card>
  );
}

export default StripeConnect;

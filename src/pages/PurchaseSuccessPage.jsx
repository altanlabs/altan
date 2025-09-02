import { Box, Container, Typography, Button, Stack, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import Iconify from '../components/iconify';
import { CompactLayout } from '../layouts/dashboard';
import { selectAccountId } from '../redux/slices/general';
import { useSelector } from '../redux/store';
import { optimai_shop } from '../utils/axios';

// ----------------------------------------------------------------------

/**
 * Track purchase completion event
 */
const trackPurchaseEvent = (sessionData) => {
  try {
    if (typeof window !== 'undefined' && window.gtag && sessionData) {
      const { plan, billing_option } = sessionData;

      // Get URL parameters for attribution
      const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());

      const value = billing_option?.price ? billing_option.price / 100 : 0;
      const currency = 'EUR';

      window.gtag('event', 'purchase', {
        transaction_id: sessionData?.subscription?.id || sessionData.session_id,
        value,
        currency,
        items: [
          {
            item_id: plan?.id,
            item_name: plan?.name,
            item_category: 'subscription',
            item_variant: plan?.name?.toLowerCase().replace(' ', '_'),
            price: value,
            quantity: 1,
          },
        ],
        // Include attribution data
        ...urlParams,
        // Additional metadata
        plan_type: plan?.name?.toLowerCase(),
        billing_frequency: billing_option?.billing_frequency,
        credits_included: plan?.credits,
        subscription_id: sessionData?.subscription?.id,
      });

      // console.debug('Purchase event tracked', {
      //   transaction_id: subscription?.id || sessionData.session_id,
      //   plan_name: plan?.name,
      //   value,
      //   currency,
      //   billing_frequency: billing_option?.billing_frequency,
      //   credits_included: plan?.credits,
      //   urlParams,
      // });
    }

    if (typeof window !== 'undefined' && window.fbq && sessionData) {
      const { plan, billing_option } = sessionData;
      const value = billing_option?.price ? billing_option.price / 100 : 0;
      window.fbq('track', 'Purchase', {
        value,
        currency: 'EUR',
        contents: plan?.id ? [{ id: plan.id, quantity: 1 }] : undefined,
        content_type: 'product',
      });
    }
  } catch {
  }
};

// ----------------------------------------------------------------------

export default function PurchaseSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const history = useHistory();
  const accountId = useSelector(selectAccountId);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Get session_id from URL params
        const urlParams = new URLSearchParams(location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setError('No session ID found in URL');
          setLoading(false);
          return;
        }

        // Fetch session data from your backend
        const response = await optimai_shop.get(`/stripe/session/${sessionId}`, {
          params: { account_id: accountId },
        });

        const data = response.data;
        // Track purchase event
        trackPurchaseEvent(data);

        setLoading(false);
      } catch {
        setError('Failed to load purchase information');
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [location.search, accountId]);

  const handleContinue = () => {
    // Redirect to home/dashboard
    history.push('/');
  };

  if (loading) {
    return (
      <CompactLayout
        maxWidth="sm"
        sx={{ py: 8 }}
      >
        <Box textAlign="center">
          <Typography variant="h6">Processing your purchase...</Typography>
        </Box>
      </CompactLayout>
    );
  }

  if (error) {
    return (
      <CompactLayout
        maxWidth="sm"
        sx={{ py: 12 }}
      >
        <Container sx={{ p: 10, textAlign: 'center' }}>
          {/* Tesla-style Error Indicator */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              mx: 'auto',
            }}
          >
            <Iconify
              icon="eva:close-fill"
              width={40}
              sx={{ color: 'common.white' }}
            />
          </Box>

          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Session not found
          </Typography>

          {/* Big Hedgehog Meme */}
          <Box
            sx={{
              width: 400,
              height: 400,
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: 3,
              mx: 'auto',
            }}
          >
            <img
              src="/assets/meme.png"
              alt="Debug hedgehog"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallbackIcon = document.createElement('div');
                fallbackIcon.innerHTML = '🦔';
                fallbackIcon.style.fontSize = '60px';
                e.target.parentNode.appendChild(fallbackIcon);
              }}
            />
          </Box>

          <Alert
            severity="error"
            sx={{ mb: 3, textAlign: 'left' }}
          >
            <Typography
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Error:</strong> {error}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Session ID:</strong>{' '}
              {new URLSearchParams(location.search).get('session_id') || 'Not found'}
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            onClick={() => history.push('/')}
            sx={{
              minWidth: 280,
              height: 48,
              borderRadius: 1,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </CompactLayout>
    );
  }

  return (
    <CompactLayout
      maxWidth="sm"
      sx={{ py: 12 }}
    >
      <Container sx={{ p: 10, textAlign: 'center' }}>
        <Stack
          spacing={4}
          alignItems="center"
        >
          {/* Tesla-style Success Indicator */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Iconify
              icon="eva:checkmark-fill"
              width={40}
              sx={{ color: 'common.white' }}
            />
          </Box>

          {/* Success Message */}
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Your order is complete
          </Typography>

          {/* Big Hedgehog Meme */}
          <Box
            sx={{
              width: 250,
              height: 250,
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: 3,
            }}
          >
            <img
              src="/assets/meme.png"
              alt="Success hedgehog celebration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.target.style.display = 'none';
                const fallbackIcon = document.createElement('div');
                fallbackIcon.innerHTML = '🎉';
                fallbackIcon.style.fontSize = '60px';
                e.target.parentNode.appendChild(fallbackIcon);
              }}
            />
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, fontSize: '1.1rem' }}
          >
            Thank you for your purchase. Your subscription has been activated.
          </Typography>
          {/* Continue Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleContinue}
            sx={{
              mt: 4,
              minWidth: 280,
              height: 48,
              borderRadius: 1,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Container>
    </CompactLayout>
  );
}

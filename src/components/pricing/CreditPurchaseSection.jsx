import { Box, Typography, Stack, TextField, Chip, Button, Card } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { selectAccountId } from '../../redux/slices/general';
import { openUrl } from '../../utils/auth';
import { optimai_shop } from '../../utils/axios';

// Credit packages with their Stripe price IDs
const CREDIT_PACKAGES = [
  {
    id: 'price_1Qr6FbKUsA7CGHPx2phx9KQS',
    price: 10,
  },
  {
    id: 'price_1Qr6FbKUsA7CGHPxHYMOIVD9',
    price: 20,
  },
  {
    id: 'price_1RiD6RKUsA7CGHPxquXwKTF6',
    price: 50,
  },
  {
    id: 'price_1RiD6vKUsA7CGHPxMJt2D9Bg',
    price: 100,
  },
];

/**
 * Track credit purchase event
 */
const trackCreditPurchaseEvent = (packageInfo) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'EUR',
        value: packageInfo.price,
        items: [{
          item_id: packageInfo.id,
          item_name: `€${packageInfo.price} Credits`,
          item_category: 'credits',
          price: packageInfo.price,
          quantity: 1,
        }],
        purchase_type: 'credits',
        amount: packageInfo.price,
      });
    }
  } catch (error) {
    console.error('Error tracking credit purchase event:', error);
  }
};

export default function CreditPurchaseSection({ title = 'Purchase credits', compact = false }) {
  const [selectedAmount, setSelectedAmount] = useState(10);
  const accountId = useSelector(selectAccountId);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
  };

  const handleCustomAmountChange = (event) => {
    const value = parseInt(event.target.value) || 0;
    setSelectedAmount(value);
  };

  const handlePurchase = async () => {
    try {
      // Find the corresponding price ID based on amount
      const packageInfo = CREDIT_PACKAGES.find(pkg => pkg.price === selectedAmount);
      if (!packageInfo) {
        console.error('No package found for amount:', selectedAmount);
        return;
      }

      // Track credit purchase event
      trackCreditPurchaseEvent(packageInfo);

      const response = await optimai_shop.get('/stripe/buy-credits', {
        params: {
          account_id: accountId,
          price_id: packageInfo.id,
        },
      });

      // Open URL using platform-aware utility
      await openUrl(response.data.url);
    } catch (error) {
      console.error('Error purchasing credits:', error);
    }
  };

  const content = (
    <Box sx={{ p: 2 }}>
      <Typography variant={compact ? 'h6' : 'h5'} sx={{ fontWeight: 600, mb:2 }}>
        {title}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {[10, 20, 50, 100].map((amount) => (
          <Chip
            key={amount}
            label={`€${amount}`}
            variant={selectedAmount === amount ? 'filled' : 'outlined'}
            color={selectedAmount === amount ? 'primary' : 'default'}
            onClick={() => handleAmountSelect(amount)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: selectedAmount === amount ? 'primary.main' : 'action.hover',
              },
            }}
          />
        ))}
      </Stack>

      <TextField
        fullWidth
        size="small"
        value={selectedAmount}
        onChange={handleCustomAmountChange}
        InputProps={{
          startAdornment: <Typography sx={{ mr: 1 }}>€</Typography>,
        }}
        sx={{ mb: 3 }}
        type="number"
        inputProps={{ min: 1 }}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={handlePurchase}
        disabled={!selectedAmount || selectedAmount <= 0}
      >
        Purchase
      </Button>
    </Box>
  );

  if (compact) {
    return content;
  }

  return (
    <Card>
      {content}
    </Card>
  );
}
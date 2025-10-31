import { useState } from 'react';
import { useSelector } from 'react-redux';

import { useAnalytics } from '../../hooks/useAnalytics';
import { selectAccountId } from '../../redux/slices/general';
import { openUrl } from '../../utils/auth';
import { optimai_shop } from '../../utils/axios';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

// Credit packages with their Stripe price IDs
const CREDIT_PACKAGES = [
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
  {
    id: 'price_1S8RdTKUsA7CGHPx4lLkUHci',
    price: 250,
  },
  {
    id: 'price_1S8RdvKUsA7CGHPxtRG9QOio',
    price: 500,
  },
];

const trackCreditPurchaseEvent = (packageInfo, analytics) => {
  try {
    const items = [{
      item_id: packageInfo.id,
      item_name: `€${packageInfo.price} Credits`,
      item_category: 'credits',
      price: packageInfo.price,
      quantity: 1,
    }];

    // Track analytics event
    analytics.trackBeginCheckout(packageInfo.price, 'EUR', items, {
      purchase_type: 'credits',
      amount: packageInfo.price,
    });

    // Track with Google Analytics (existing)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'EUR',
        value: packageInfo.price,
        items,
        purchase_type: 'credits',
        amount: packageInfo.price,
      });
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: packageInfo.price,
        currency: 'EUR',
      });
    }
  } catch (error) {
    console.error('Error tracking credit purchase event:', error);
  }
};

export default function CreditPurchaseSection({ title = 'Pay as you go', compact = false }) {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const accountId = useSelector(selectAccountId);
  const analytics = useAnalytics();

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
      trackCreditPurchaseEvent(packageInfo, analytics);

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
    <div className="p-4">
      <h3 className={`font-semibold mb-4 ${compact ? 'text-lg' : 'text-xl'} text-gray-900 dark:text-white`}>
        {title}
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {[20, 50, 100, 250, 500].map((amount) => (
          <Badge
            key={amount}
            variant={selectedAmount === amount ? 'default' : 'outline'}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${
              selectedAmount === amount
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleAmountSelect(amount)}
          >
            €{amount}
          </Badge>
        ))}
      </div>

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 text-sm">
          €
        </span>
        <Input
          type="number"
          value={selectedAmount}
          onChange={handleCustomAmountChange}
          className="pl-8 bg-white dark:bg-gray-800"
          min={1}
        />
      </div>

      <Button
        onClick={handlePurchase}
        disabled={!selectedAmount || selectedAmount <= 0}
        className="w-full font-medium"
      >
        Purchase
      </Button>
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      {content}
    </Card>
  );
}

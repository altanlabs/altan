import { useTheme } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';

import useFeedbackDispatch from '../../../../../hooks/useFeedbackDispatch';
import { updateSubscription } from '../../../../../redux/slices/money';
import { optimai } from '../../../../../utils/axios';

export default function DialogUpgradeSub({ open, onClose, subscription }) {
  const t = useTheme();
  const themeMode = t.palette.mode;
  const [pricing, setPricing] = useState(null);
  const [selected, setSelected] = useState(0);
  const [billingFrequency, setBillingFrequency] = useState(
    subscription?.billing_option?.billing_frequency || 'monthly',
  );
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  useEffect(() => {
    const fetchPricing = async () => {
      const response = await optimai.get('/templates/pricing');
      const groupPricing = response.data.pricing.find(
        (g) => g.id === subscription?.billing_option?.plan?.group_id,
      );

      if (groupPricing) {
        // Filter out free plans and sort by credits
        const filteredPlans = groupPricing.plans.items
          .filter((plan) => plan.name.toLowerCase() !== 'free')
          .sort((a, b) => a.credits - b.credits);

        // Find current plan index
        const currentIndex = filteredPlans.findIndex(
          (plan) => plan.id === subscription?.billing_option?.plan?.id,
        );
        setSelected(currentIndex >= 0 ? currentIndex : 0);

        setPricing({
          ...groupPricing,
          plans: {
            ...groupPricing.plans,
            items: filteredPlans,
          },
        });
      }
    };
    if (open && subscription) {
      fetchPricing();
      // Set initial billing frequency from current subscription
      setBillingFrequency(subscription.billing_option?.billing_frequency || 'monthly');
    }
  }, [open, subscription]);

  const formatPrice = (priceInCents) =>
    (priceInCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const getPriceForFrequency = (plan, frequency) => {
    const opt = plan.billing_options?.items.find((o) => o.billing_frequency === frequency);
    return opt ? opt.price : 0;
  };

  const handleUpgrade = async () => {
    if (!pricing) return;

    const plan = pricing.plans.items[selected];
    const billingOption = plan.billing_options.items.find(
      (option) => option.billing_frequency === billingFrequency,
    );

    if (!billingOption) {
      console.error('No billing option found');
      return;
    }

    await dispatchWithFeedback(
      updateSubscription({
        subscriptionId: subscription.id,
        billingOptionId: billingOption.id,
        autoincrease: null,
      }),
      {
        successMessage: 'Subscription updated successfully',
        errorMessage: 'Failed to update subscription',
        useSnackbar: true,
      },
    );

    onClose();
  };

  const isYearly = billingFrequency === 'yearly';
  const yearlyDiscountPercentage = 100 * (2 / 12);

  if (!pricing) return null;

  const currentPlan = pricing.plans.items[selected];
  const currentPrice = currentPlan ? getPriceForFrequency(currentPlan, billingFrequency) : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Upgrade Subscription
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div
          className={`my-8 border rounded-lg p-4 shadow-lg ${
            themeMode === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <span
                className={`text-xl font-semibold ${
                  themeMode === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {pricing.name}
              </span>
            </div>
            <div
              className={`font-bold ${themeMode === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
            >
              {formatPrice(currentPrice)}
              {isYearly ? '/year' : '/mo'}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="range"
              min={0}
              max={pricing.plans.items.length - 1}
              step={1}
              value={selected}
              onChange={(e) => setSelected(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div
              className={`text-sm whitespace-nowrap ${
                themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {currentPlan && `${currentPlan.credits.toLocaleString()} credits`}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center mt-8 space-x-3">
          <div
            className={`inline-flex rounded-full p-1 ${
              themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <button
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                !isYearly ? 'bg-blue-500 text-white shadow' : 'text-gray-300'
              }`}
              onClick={() => setBillingFrequency('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                isYearly ? 'bg-blue-500 text-white shadow' : 'text-gray-300'
              }`}
              onClick={() => setBillingFrequency('yearly')}
            >
              Yearly
            </button>
          </div>
          {isYearly && (
            <span className="text-sm text-green-400 font-medium">
              Save {yearlyDiscountPercentage.toFixed(1)}%
            </span>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          onClick={handleUpgrade}
        >
          Upgrade Plan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

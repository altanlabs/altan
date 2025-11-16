import { Box, Typography, useTheme } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { findClient, createOrder, prepareOrderData } from '@redux/slices/money';

import { validateAccountIds, fetchExchangeRates } from './@subscriptions/helpers';
import PlanSummary from './@subscriptions/PlanSummary';
import SubscriptionPlan from './@subscriptions/SubscriptionPlan';
import { useFetchSubscription } from './@subscriptions/useFetchSubscription';
import { currencyData, formatPricing } from './@utils';
import { useAuthContext } from '../../auth/useAuthContext.ts';

const currencies = Object.entries(currencyData).map(([code, data]) => ({
  code,
  name: code, // Puedes agregar nombres completos si lo deseas
  symbol: data.symbol,
  locale: data.locale,
  icon: data.icon,
}));

export default function SubscriptionGroup({ subscriptionIds, onClose, currentPlanId = null }) {
  const accountId = useSelector((state) => state.general.account.id);
  const { user } = useAuthContext();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [yearly, setYearly] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, EUR: 0.85, GBP: 0.73 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const {
    planGroups,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useFetchSubscription(subscriptionIds);

  useEffect(() => {
    fetchExchangeRates().then(setExchangeRates).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentPlanId && planGroups.length > 0) {
      console.log('planGroups', planGroups);
      // Find which plan group contains the current plan
      planGroups.forEach((group, index) => {
        const plan = group.plans.items.find((p) => p.id === currentPlanId);
        if (plan) {
          setActiveStep(index);
          setSelectedPlans((prev) => ({
            ...prev,
            [index]: plan,
          }));
        }
      });
    }
  }, [currentPlanId, planGroups]);

  const handleSubscribe = useCallback(async () => {
    if (!validateAccountIds(planGroups)) {
      setError('Invalid account IDs. Please contact support.');
      return;
    }

    try {
      setIsLoading(true);
      const client = await findClient(accountId, user.id);
      const orderData = prepareOrderData(selectedPlans, selectedCurrency.code, yearly);
      orderData.client_id = client.id;
      orderData.meta_data = {
        account_id: accountId,
      };
      const order = await createOrder(orderData);
      const checkoutUrl = `https://pay.altan.ai/checkout/${order.id}?theme=${theme.palette.mode}&step=pay`;
      const width = 550;
      const height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const checkoutWindow = window.open(
        checkoutUrl,
        'CheckoutWindow',
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Add an interval to check if the window has been closed
      const checkWindowClosed = setInterval(() => {
        if (checkoutWindow.closed) {
          clearInterval(checkWindowClosed);
          onClose();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to create order:', error);
      setError('Failed to create order. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [planGroups, selectedPlans, selectedCurrency, yearly, accountId, theme.palette.mode, onClose]);

  const handlePlanSelection = useCallback((step, plan) => {
    setSelectedPlans((prev) => ({ ...prev, [step]: plan }));
  }, []);

  const handleCurrencyChange = useCallback((newCurrency) => {
    setSelectedCurrency(newCurrency || currencies[0]);
  }, []);

  const handleBillingToggle = useCallback(() => {
    setYearly((prev) => !prev);
  }, []);

  const handleStepChange = useCallback((newStep) => {
    setActiveStep(newStep);
  }, []);

  const convertCurrency = useCallback(
    (amount) => {
      return formatPricing(amount * exchangeRates[selectedCurrency.code], selectedCurrency.code);
    },
    [exchangeRates, selectedCurrency],
  );

  const getPlanPrice = useCallback(
    (plan) => {
      return yearly
        ? plan.billing_options.items.find((b) => b.billing_frequency === 'yearly')?.price || 0
        : plan.billing_options.items.find((b) => b.billing_frequency === 'monthly')?.price || 0;
    },
    [yearly],
  );

  if (isLoadingSubscription) return <>Loading...</>;
  if (subscriptionError) return <Typography color="error">{subscriptionError}</Typography>;
  if (planGroups.length === 0) return <Typography>No plan data available.</Typography>;

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, pb: { xs: 20, md: 0 } }}>
      <Typography
        variant="h4"
        textAlign="center"
      >
        {planGroups[activeStep].name}
      </Typography>
      <Typography
        textAlign="center"
        mb={4}
      >
        {planGroups[activeStep].description}
      </Typography>
      {/* <SubscriptionStepper
        planGroups={planGroups}
        activeStep={activeStep}
        onStepChange={handleStepChange}
      /> */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={3}
      >
        <SubscriptionPlan
          plans={planGroups[activeStep]?.plans}
          step={activeStep}
          selectedPlan={selectedPlans[activeStep]}
          yearly={yearly}
          selectedCurrency={selectedCurrency}
          onPlanSelect={handlePlanSelection}
          convertCurrency={convertCurrency}
          getPlanPrice={getPlanPrice}
        />
        <PlanSummary
          selectedPlans={selectedPlans}
          yearly={yearly}
          selectedCurrency={selectedCurrency}
          currencies={currencies}
          onCurrencyChange={handleCurrencyChange}
          onBillingToggle={handleBillingToggle}
          onSubscribe={handleSubscribe}
          isLastStep={activeStep === planGroups.length - 1}
          onNextStep={() => setActiveStep((prev) => prev + 1)}
          convertCurrency={convertCurrency}
          getPlanPrice={getPlanPrice}
        />
      </Box>
    </Box>
  );
}

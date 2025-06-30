export const validateAccountIds = (planGroups) => {
  const accountIds = planGroups.map((group) => group.account_id);
  return accountIds.every((id) => id === accountIds[0]);
};

export const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return { USD: 1, EUR: 0.85, GBP: 0.73 }; // Fallback rates
  }
};

export const convertCurrency = (amount, exchangeRates, selectedCurrency) => {
  return (amount * exchangeRates[selectedCurrency.code]).toFixed(2);
};

export const getPlanPrice = (plan, yearly) => {
  return yearly
    ? plan.billing_options.items.find((b) => b.billing_frequency === 'yearly')?.price / 100 || 0
    : plan.billing_options.items.find((b) => b.billing_frequency === 'monthly')?.price / 100 || 0;
};

export const sortPlans = (plans, getPlanPrice) => {
  return [...plans.items].sort((a, b) => getPlanPrice(a) - getPlanPrice(b));
};

export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

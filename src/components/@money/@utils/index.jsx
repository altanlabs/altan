export const currencyData = {
  USD: { symbol: '$', icon: 'emojione:flag-for-united-states', locale: 'en-US' },
  EUR: { symbol: '€', icon: 'emojione:flag-for-european-union', locale: 'de-DE' },
  GBP: { symbol: '£', icon: 'emojione:flag-for-united-kingdom', locale: 'en-GB' },
  JPY: { symbol: '¥', icon: 'emojione:flag-for-japan', locale: 'ja-JP' },
  CAD: { symbol: 'C$', icon: 'emojione:flag-for-canada', locale: 'en-CA' },
  AUD: { symbol: 'A$', icon: 'emojione:flag-for-australia', locale: 'en-AU' },
  CHF: { symbol: 'Fr', icon: 'emojione:flag-for-switzerland', locale: 'de-CH' },
  CNY: { symbol: '¥', icon: 'emojione:flag-for-china', locale: 'zh-CN' },
  INR: { symbol: '₹', icon: 'emojione:flag-for-india', locale: 'hi-IN' },
  BRL: { symbol: 'R$', icon: 'emojione:flag-for-brazil', locale: 'pt-BR' },
  RUB: { symbol: '₽', icon: 'emojione:flag-for-russia', locale: 'ru-RU' },
  KRW: { symbol: '₩', icon: 'emojione:flag-for-south-korea', locale: 'ko-KR' },
  MXN: { symbol: '$', icon: 'emojione:flag-for-mexico', locale: 'es-MX' },
  SGD: { symbol: 'S$', icon: 'emojione:flag-for-singapore', locale: 'en-SG' },
};

export const formatPricing = (amount, currency) => {
  const { locale } = currencyData[currency] || { locale: 'en-US' };
  return parseFloat(amount / 100).toLocaleString(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function convertAmount(amount, fromCurrency, toCurrency, exchangeRates) {
  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];
  return (amount / fromRate) * toRate;
}

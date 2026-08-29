import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

const CURRENCY_STORAGE_KEY = 'sharpbuy_selected_currency';

export const CURRENCIES = [
  { code: 'RUB', symbol: '₽', label: 'RUB (₽)', prefix: false },
  { code: 'USD', symbol: '$', label: 'USD ($)', prefix: true },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', prefix: true },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', prefix: true },
  { code: 'USDT', symbol: '₮', label: 'USDT (₮)', prefix: true },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState('RUB');
  const [rates, setRates] = useState({
    RUB: 1,
    USD: 1 / 92.0,
    EUR: 1 / 100.0,
    GBP: 1 / 118.0,
    USDT: 1 / 92.0,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && CURRENCIES.some((c) => c.code === saved)) {
        setCurrencyState(saved);
      }
    } catch (e) {}

    // Fetch live currency rates against RUB
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.rates && data.rates.RUB) {
          const usdToRub = data.rates.RUB; // e.g. 92
          const usdToEur = data.rates.EUR || 0.92;
          const usdToGbp = data.rates.GBP || 0.78;

          setRates({
            RUB: 1,
            USD: 1 / usdToRub,
            EUR: usdToEur / usdToRub,
            GBP: usdToGbp / usdToRub,
            USDT: 1 / usdToRub,
          });
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (newCode) => {
    setCurrencyState(newCode);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCode);
    } catch (e) {}
  };

  /**
   * Converts and formats a price in RUB to the selected currency
   */
  const formatPrice = (priceInRub, options = {}) => {
    const numRub = Number(priceInRub) || 0;
    const currObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
    const rate = rates[currency] || 1;

    const converted = numRub * rate;

    let formattedVal;
    if (currency === 'RUB') {
      formattedVal = Math.round(converted).toLocaleString('ru-RU');
      return `${formattedVal} ₽`;
    } else {
      formattedVal = converted.toFixed(2);
      return currObj.prefix ? `${currObj.symbol}${formattedVal}` : `${formattedVal} ${currObj.symbol}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        currencies: CURRENCIES,
        rates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

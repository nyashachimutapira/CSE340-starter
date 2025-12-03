/**
 * Currency Conversion & Formatting Utility
 * Supports: USD, EUR, ZWD (Zimbabwean Dollar)
 */

const CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 1.0 // Base currency
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.92 // 1 USD = 0.92 EUR (example rate)
  },
  ZWD: {
    code: 'ZWD',
    symbol: 'Z$',
    name: 'Zimbabwean Dollar',
    rate: 800.0 // 1 USD = 800 ZWD (example rate, adjust as needed)
  }
};

/**
 * Get all available currencies
 */
function getAvailableCurrencies() {
  return Object.values(CURRENCIES);
}

/**
 * Convert price from USD to target currency
 * @param {number} priceInUSD - Price in US Dollars
 * @param {string} targetCurrency - Target currency code (USD, EUR, ZWD)
 * @returns {number} Converted price
 */
function convertPrice(priceInUSD, targetCurrency = 'USD') {
  const currency = CURRENCIES[targetCurrency];
  if (!currency) {
    console.warn(`Currency ${targetCurrency} not found, using USD`);
    return priceInUSD;
  }
  return priceInUSD * currency.rate;
}

/**
 * Format price with currency symbol and code
 * @param {number} priceInUSD - Price in US Dollars
 * @param {string} currency - Currency code (USD, EUR, ZWD)
 * @returns {string} Formatted price (e.g., "$25,000.00", "€23,000.00", "Z$20,000,000.00")
 */
function formatPrice(priceInUSD, currency = 'USD') {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) {
    return `$${priceInUSD.toLocaleString()}`;
  }

  const convertedPrice = convertPrice(priceInUSD, currency);
  const formatted = convertedPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${currencyInfo.symbol}${formatted}`;
}

/**
 * Format price with full currency code
 * @param {number} priceInUSD - Price in US Dollars
 * @param {string} currency - Currency code (USD, EUR, ZWD)
 * @returns {string} Formatted price with code (e.g., "25,000.00 USD", "23,000.00 EUR")
 */
function formatPriceWithCode(priceInUSD, currency = 'USD') {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) {
    return `${priceInUSD.toLocaleString()} USD`;
  }

  const convertedPrice = convertPrice(priceInUSD, currency);
  const formatted = convertedPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${formatted} ${currencyInfo.code}`;
}

/**
 * Get currency symbol by code
 * @param {string} currency - Currency code (USD, EUR, ZWD)
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(currency = 'USD') {
  const currencyInfo = CURRENCIES[currency];
  return currencyInfo ? currencyInfo.symbol : '$';
}

/**
 * Get currency name by code
 * @param {string} currency - Currency code (USD, EUR, ZWD)
 * @returns {string} Currency name
 */
function getCurrencyName(currency = 'USD') {
  const currencyInfo = CURRENCIES[currency];
  return currencyInfo ? currencyInfo.name : 'US Dollar';
}

/**
 * Update exchange rate for a currency
 * @param {string} currency - Currency code (USD, EUR, ZWD)
 * @param {number} rate - New exchange rate
 */
function setExchangeRate(currency, rate) {
  if (CURRENCIES[currency]) {
    CURRENCIES[currency].rate = rate;
  }
}

/**
 * Get current exchange rate for a currency
 * @param {string} currency - Currency code (USD, EUR, ZWD)
 * @returns {number} Exchange rate
 */
function getExchangeRate(currency = 'USD') {
  const currencyInfo = CURRENCIES[currency];
  return currencyInfo ? currencyInfo.rate : 1.0;
}

/**
 * Format multiple currencies for comparison
 * @param {number} priceInUSD - Price in US Dollars
 * @returns {Object} Prices in all currencies
 */
function getPriceInAllCurrencies(priceInUSD) {
  const prices = {};
  Object.keys(CURRENCIES).forEach(currency => {
    prices[currency] = {
      formatted: formatPrice(priceInUSD, currency),
      formattedWithCode: formatPriceWithCode(priceInUSD, currency),
      value: convertPrice(priceInUSD, currency)
    };
  });
  return prices;
}

module.exports = {
  CURRENCIES,
  getAvailableCurrencies,
  convertPrice,
  formatPrice,
  formatPriceWithCode,
  getCurrencySymbol,
  getCurrencyName,
  setExchangeRate,
  getExchangeRate,
  getPriceInAllCurrencies
};

const currency = require("../utilities/currency");

const currencyController = {};

/**
 * Get available currencies
 */
currencyController.getAvailableCurrencies = async function(req, res) {
  try {
    const currencies = currency.getAvailableCurrencies();
    res.json({
      success: true,
      currencies: currencies
    });
  } catch (err) {
    console.error("Get currencies error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch currencies"
    });
  }
};

/**
 * Convert price to specific currency
 */
currencyController.convertPrice = async function(req, res) {
  try {
    const { priceUSD, targetCurrency = 'USD' } = req.query;

    if (!priceUSD || isNaN(priceUSD)) {
      return res.status(400).json({
        success: false,
        message: "Invalid price provided"
      });
    }

    const convertedPrice = currency.convertPrice(parseFloat(priceUSD), targetCurrency);
    const formatted = currency.formatPrice(parseFloat(priceUSD), targetCurrency);

    res.json({
      success: true,
      priceUSD: parseFloat(priceUSD),
      targetCurrency: targetCurrency,
      convertedPrice: convertedPrice,
      formatted: formatted,
      symbol: currency.getCurrencySymbol(targetCurrency),
      name: currency.getCurrencyName(targetCurrency)
    });
  } catch (err) {
    console.error("Convert price error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to convert price"
    });
  }
};

/**
 * Get price in all currencies
 */
currencyController.getPriceInAllCurrencies = async function(req, res) {
  try {
    const { priceUSD } = req.query;

    if (!priceUSD || isNaN(priceUSD)) {
      return res.status(400).json({
        success: false,
        message: "Invalid price provided"
      });
    }

    const prices = currency.getPriceInAllCurrencies(parseFloat(priceUSD));

    res.json({
      success: true,
      priceUSD: parseFloat(priceUSD),
      allPrices: prices
    });
  } catch (err) {
    console.error("Get all prices error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch prices"
    });
  }
};

/**
 * Update exchange rate (admin only)
 */
currencyController.updateExchangeRate = async function(req, res) {
  try {
    // In production, add admin authentication check
    // if (!req.account || req.account.account_type !== 'Admin') {
    //   return res.status(403).json({ success: false, message: "Unauthorized" });
    // }

    const { currency: currencyCode, rate } = req.body;

    if (!currencyCode || !rate || isNaN(rate) || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid currency code or rate"
      });
    }

    currency.setExchangeRate(currencyCode, parseFloat(rate));

    res.json({
      success: true,
      message: `Exchange rate updated for ${currencyCode}`,
      currency: currencyCode,
      newRate: parseFloat(rate)
    });
  } catch (err) {
    console.error("Update exchange rate error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to update exchange rate"
    });
  }
};

module.exports = currencyController;

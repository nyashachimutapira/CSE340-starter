const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Currency routes
router.get("/available", asyncHandler(currencyController.getAvailableCurrencies));
router.get("/convert", asyncHandler(currencyController.convertPrice));
router.get("/all-prices", asyncHandler(currencyController.getPriceInAllCurrencies));
router.post("/update-rate", asyncHandler(currencyController.updateExchangeRate));

module.exports = router;

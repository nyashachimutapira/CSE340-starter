const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Checkout routes
router.get("/", asyncHandler(checkoutController.viewCheckout));
router.post("/process", asyncHandler(checkoutController.processCheckout));
router.get("/confirmation/:orderId", asyncHandler(checkoutController.viewConfirmation));
router.get("/order-history", asyncHandler(checkoutController.viewOrderHistory));
router.get("/stock/:invId", asyncHandler(checkoutController.getStockStatus));

module.exports = router;

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Display checkout page
router.get("/checkout", orderController.buildCheckout);

// Place order
router.post("/place", orderController.placeOrder);

// Display order confirmation
router.get("/confirmation/:orderId", orderController.buildConfirmation);

// Display order history
router.get("/history", orderController.buildOrderHistory);

// Get order details (API)
router.get("/:orderId", orderController.getOrderDetails);

module.exports = router;

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const utilities = require("../utilities");

// View shopping cart
router.get("/", utilities.handleErrors(cartController.viewCart));

// Add item to cart (JSON)
router.post("/add", utilities.handleErrors(cartController.addToCart));

// Update item quantity
router.post("/update-quantity", utilities.handleErrors(cartController.updateQuantity));

// Remove item from cart
router.post("/remove", utilities.handleErrors(cartController.removeItem));

// Clear entire cart
router.post("/clear", utilities.handleErrors(cartController.clearCart));

module.exports = router;

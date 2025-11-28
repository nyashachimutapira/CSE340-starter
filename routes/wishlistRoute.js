const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const utilities = require("../utilities");

// View wishlist
router.get("/", utilities.handleErrors(wishlistController.viewWishlist));

// Add item to wishlist (JSON)
router.post("/add", utilities.handleErrors(wishlistController.addToWishlist));

// Remove item from wishlist
router.post("/remove", utilities.handleErrors(wishlistController.removeFromWishlist));

module.exports = router;

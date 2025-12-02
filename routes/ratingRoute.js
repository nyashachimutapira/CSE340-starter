const express = require("express");
const router = new express.Router();
const ratingController = require("../controllers/ratingController");
const utilities = require("../utilities");

// Get average rating and count for an item
router.get(
  "/item/:invId",
  utilities.handleErrors(ratingController.getAverageForItem)
);

// Get logged-in user's rating for an item
router.get(
  "/user/:invId",
  utilities.requireAuth,
  utilities.handleErrors(ratingController.getUserRatingForItem)
);

// Save or update a user's rating
router.post(
  "/",
  utilities.requireAuth,
  utilities.handleErrors(ratingController.saveUserRating)
);

module.exports = router;

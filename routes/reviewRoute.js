const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");

// Show form to add a review for an inventory item
router.get(
  "/add/:invId",
  utilities.requireAuth,
  utilities.handleErrors(reviewController.buildAddReviewView)
);

// Handle review submission
router.post(
  "/add",
  utilities.requireAuth,
  utilities.handleErrors(reviewController.addReview)
);

// List reviews for an item
router.get(
  "/item/:invId",
  utilities.handleErrors(reviewController.listReviewsForItem)
);

module.exports = router;

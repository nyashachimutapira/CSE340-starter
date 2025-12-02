const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

const reviewController = {};

reviewController.buildAddReviewView = async function buildAddReviewView(req, res) {
  const invId = Number(req.params.invId || req.query.inv_id);
  const nav = await utilities.getNav();
  try {
    res.render("reviews/add-review", {
      title: "Add Review",
      nav,
      inv_id: invId,
    });
  } catch (err) {
    console.error('Render add review error:', err);
    req.flash('error', 'Reviews are temporarily unavailable.');
    return res.redirect(`/inv/detail/${invId}`);
  }
};

reviewController.addReview = async function addReview(req, res) {
  try {
    const { inv_id, rating, review_text } = req.body;

    // Validate
    const parsedRating = Number(rating);
    if (!inv_id || !req.account) {
      req.flash("error", "Missing inventory or authentication info.");
      return res.redirect("/account/login");
    }

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      const nav = await utilities.getNav();
      req.flash("error", "Rating must be an integer between 1 and 5.");
      return res.status(400).render("reviews/add-review", {
        title: "Add Review",
        nav,
        inv_id,
        rating,
        review_text,
        errors: [{ msg: "Rating must be between 1 and 5." }],
      });
    }

    const reviewData = {
      inv_id: Number(inv_id),
      account_id: Number(req.account.account_id),
      rating: parsedRating,
      review_text: review_text && review_text.trim().length ? review_text.trim() : null,
    };

    try {
      await reviewModel.addReview(reviewData);
      req.flash("success", "Thank you — your review was posted.");
      return res.redirect(`/reviews/item/${inv_id}`);
    } catch (dbErr) {
      // If the reviews table is missing (42P01) or other table issue, give a friendly message
      console.error('Add review DB error:', dbErr && dbErr.message ? dbErr.message : dbErr);
      if (dbErr && dbErr.code === '42P01') {
        req.flash('error', 'Reviews feature is not yet available. Please create the reviews table first.');
        return res.redirect(`/inv/detail/${inv_id}`);
      }
      // For other DB errors, still redirect gracefully
      req.flash('error', 'Unable to save your review. Please try again.');
      return res.redirect(`/inv/detail/${inv_id}`);
    }
  } catch (err) {
    console.error(err);
    const message = err.message || "Sorry, we could not add your review.";
    const nav = await utilities.getNav();
    req.flash("error", message);
    res.status(err.status || 500).render("reviews/add-review", {
      title: "Add Review",
      nav,
      errors: [{ msg: message }],
      ...req.body,
    });
  }
};

reviewController.listReviewsForItem = async function listReviewsForItem(req, res) {
  const invId = Number(req.params.invId);
  try {
    const [nav, reviews, avg] = await Promise.all([
      utilities.getNav(),
      reviewModel.getReviewsByInv(invId),
      reviewModel.getAverageRating(invId),
    ]);

    res.render("reviews/list", {
      title: "Reviews",
      nav,
      reviews,
      average: avg ? avg.average_rating : 0,
      review_count: avg ? Number(avg.review_count) : 0,
      inv_id: invId,
    });
  } catch (err) {
    console.error('List reviews error:', err);
    // If reviews table doesn't exist, show a friendly page
    if (err && err.code === '42P01') {
      const nav = await utilities.getNav();
      return res.render('reviews/list', {
        title: 'Reviews',
        nav,
        reviews: [],
        average: 0,
        review_count: 0,
        inv_id: invId,
      });
    }
    throw err;
  }
};

module.exports = reviewController;

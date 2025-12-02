const ratingModel = require("../models/rating-model");
const utilities = require("../utilities");

const ratingController = {};

ratingController.getAverageForItem = async function getAverageForItem(req, res) {
  const invId = Number(req.params.invId);
  try {
    const avg = await ratingModel.getAverageRating(invId);
    res.json({ average: avg ? avg.average_rating : 0, count: avg ? Number(avg.rating_count) : 0 });
  } catch (err) {
    // If ratings table is missing or other DB error, return safe defaults
    if (err && err.code === '42P01') {
      return res.json({ average: 0, count: 0 });
    }
    console.error('Rating avg error:', err);
    res.status(500).json({ error: 'Unable to load ratings at this time.' });
  }
};

ratingController.getUserRatingForItem = async function getUserRatingForItem(req, res) {
  if (!req.account) return res.status(401).json({ error: "Unauthorized" });
  const invId = Number(req.params.invId);
  try {
    const userRating = await ratingModel.getUserRating(invId, req.account.account_id);
    res.json({ rating: userRating ? Number(userRating.rating) : null });
  } catch (err) {
    if (err && err.code === '42P01') {
      return res.json({ rating: null });
    }
    console.error('User rating error:', err);
    res.status(500).json({ error: 'Unable to load user rating.' });
  }
};

ratingController.saveUserRating = async function saveUserRating(req, res) {
  try {
    if (!req.account) return res.status(401).json({ error: "Unauthorized" });
    const { inv_id, rating } = req.body;
    const parsedRating = Number(rating);
    if (!inv_id || !Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Invalid input." });
    }

    const saved = await ratingModel.upsertRating({ inv_id: Number(inv_id), account_id: Number(req.account.account_id), rating: parsedRating });
    res.json({ success: true, rating: Number(saved.rating) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Unable to save rating." });
  }
};

module.exports = ratingController;

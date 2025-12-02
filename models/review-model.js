const pool = require("../database/");

async function addReview({ inv_id, account_id, rating, review_text }) {
  const sql = `
    INSERT INTO public.reviews (inv_id, account_id, rating, review_text)
    VALUES ($1, $2, $3, $4)
    RETURNING review_id, inv_id, account_id, rating, review_text, created_at
  `;

  const values = [Number(inv_id), Number(account_id), Number(rating), review_text || null];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    // Preserve the original error code for higher-level handlers
    const dbError = new Error("Unable to add the review right now. Please try again.");
    dbError.status = 500;
    dbError.code = error.code; // Pass through the Postgres error code (e.g., '42P01' for missing table)
    dbError.cause = error;
    throw dbError;
  }
}

async function getReviewsByInv(invId) {
  const sql = `
    SELECT r.review_id, r.inv_id, r.account_id, r.rating, r.review_text, r.created_at,
           a.account_firstname, a.account_lastname
    FROM public.reviews r
    JOIN public.account a ON r.account_id = a.account_id
    WHERE r.inv_id = $1
    ORDER BY r.created_at DESC
  `;

  const result = await pool.query(sql, [Number(invId)]);
  return result.rows;
}

async function getAverageRating(invId) {
  const sql = `
    SELECT COALESCE(ROUND(AVG(rating)::numeric,2),0) AS average_rating, COUNT(*) AS review_count
    FROM public.reviews
    WHERE inv_id = $1
  `;

  const result = await pool.query(sql, [Number(invId)]);
  return result.rows[0];
}

async function getReviewsByAccount(accountId) {
  const sql = `
    SELECT r.review_id, r.inv_id, r.rating, r.review_text, r.created_at,
           i.inv_make, i.inv_model, i.inv_year
    FROM public.reviews r
    JOIN public.inventory i ON r.inv_id = i.inv_id
    WHERE r.account_id = $1
    ORDER BY r.created_at DESC
  `;

  const result = await pool.query(sql, [Number(accountId)]);
  return result.rows;
}

module.exports = {
  addReview,
  getReviewsByInv,
  getAverageRating,
  getReviewsByAccount,
};

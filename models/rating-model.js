const pool = require("../database/");

/**
 * Upsert a user's rating for an inventory item.
 * If a rating exists for (inv_id, account_id) it will be updated.
 */
async function upsertRating({ inv_id, account_id, rating }) {
  const sql = `
    INSERT INTO public.ratings (inv_id, account_id, rating)
    VALUES ($1, $2, $3)
    ON CONFLICT (inv_id, account_id) DO UPDATE SET rating = EXCLUDED.rating
    RETURNING rating_id, inv_id, account_id, rating, created_at
  `;

  const values = [Number(inv_id), Number(account_id), Number(rating)];
  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    const dbError = new Error("Unable to save rating right now. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

async function getAverageRating(invId) {
  const sql = `
    SELECT COALESCE(ROUND(AVG(rating)::numeric,2),0) AS average_rating, COUNT(*) AS rating_count
    FROM public.ratings
    WHERE inv_id = $1
  `;

  const result = await pool.query(sql, [Number(invId)]);
  return result.rows[0];
}

async function getUserRating(invId, accountId) {
  const sql = `
    SELECT rating_id, inv_id, account_id, rating, created_at
    FROM public.ratings
    WHERE inv_id = $1 AND account_id = $2
  `;

  const result = await pool.query(sql, [Number(invId), Number(accountId)]);
  return result.rows[0] || null;
}

module.exports = {
  upsertRating,
  getAverageRating,
  getUserRating,
};

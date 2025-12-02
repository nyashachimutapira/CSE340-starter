const pool = require('../database/');

async function isFavorited(invId, accountId) {
  const sql = `SELECT 1 FROM public.favorites WHERE inv_id = $1 AND account_id = $2`;
  const result = await pool.query(sql, [Number(invId), Number(accountId)]);
  return result.rows.length > 0;
}

async function addFavorite(invId, accountId) {
  const sql = `INSERT INTO public.favorites (inv_id, account_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING favorite_id`;
  const result = await pool.query(sql, [Number(invId), Number(accountId)]);
  return result.rows[0] || null;
}

async function removeFavorite(invId, accountId) {
  const sql = `DELETE FROM public.favorites WHERE inv_id = $1 AND account_id = $2 RETURNING favorite_id`;
  const result = await pool.query(sql, [Number(invId), Number(accountId)]);
  return result.rows[0] || null;
}

module.exports = { isFavorited, addFavorite, removeFavorite };

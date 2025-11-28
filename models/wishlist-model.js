const pool = require("../database/");

async function getWishlistByAccountId(accountId) {
  const sql = `
    SELECT 
      w.wishlist_id,
      w.account_id,
      w.inv_id,
      w.added_at,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      i.inv_price,
      i.inv_image,
      i.inv_thumbnail
    FROM public.wishlist w
    JOIN public.inventory i ON w.inv_id = i.inv_id
    WHERE w.account_id = $1
    ORDER BY w.added_at DESC
  `;
  const result = await pool.query(sql, [Number(accountId)]);
  return result.rows;
}

async function getWishlistItem(accountId, invId) {
  const sql = `
    SELECT *
    FROM public.wishlist
    WHERE account_id = $1 AND inv_id = $2
  `;
  const result = await pool.query(sql, [Number(accountId), Number(invId)]);
  return result.rows[0];
}

async function addToWishlist(accountId, invId) {
  const sql = `
    INSERT INTO public.wishlist (account_id, inv_id)
    VALUES ($1, $2)
    RETURNING *
  `;
  try {
    const result = await pool.query(sql, [Number(accountId), Number(invId)]);
    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const duplicate = new Error("This item is already in your wishlist.");
      duplicate.status = 400;
      throw duplicate;
    }
    const dbError = new Error("Unable to add item to wishlist. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

async function removeFromWishlist(wishlistId) {
  const sql = `
    DELETE FROM public.wishlist
    WHERE wishlist_id = $1
    RETURNING *
  `;
  try {
    const result = await pool.query(sql, [Number(wishlistId)]);
    return result.rows[0];
  } catch (error) {
    const dbError = new Error("Unable to remove item from wishlist. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

module.exports = {
  getWishlistByAccountId,
  getWishlistItem,
  addToWishlist,
  removeFromWishlist,
};

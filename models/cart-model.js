const pool = require("../database/");

async function getCartByAccountId(accountId) {
  const sql = `
    SELECT 
      sc.cart_id,
      sc.account_id,
      sc.inv_id,
      sc.quantity,
      sc.added_at,
      i.inv_make,
      i.inv_model,
      i.inv_year,
      i.inv_price,
      i.inv_image,
      i.inv_thumbnail
    FROM public.shopping_cart sc
    JOIN public.inventory i ON sc.inv_id = i.inv_id
    WHERE sc.account_id = $1
    ORDER BY sc.added_at DESC
  `;
  const result = await pool.query(sql, [Number(accountId)]);
  return result.rows;
}

async function getCartItem(accountId, invId) {
  const sql = `
    SELECT *
    FROM public.shopping_cart
    WHERE account_id = $1 AND inv_id = $2
  `;
  const result = await pool.query(sql, [Number(accountId), Number(invId)]);
  return result.rows[0];
}

async function addToCart(accountId, invId, quantity = 1) {
  const sql = `
    INSERT INTO public.shopping_cart (account_id, inv_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (account_id, inv_id)
    DO UPDATE SET quantity = shopping_cart.quantity + $3
    RETURNING *
  `;
  try {
    const result = await pool.query(sql, [Number(accountId), Number(invId), Number(quantity)]);
    return result.rows[0];
  } catch (error) {
    const dbError = new Error("Unable to add item to cart. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

async function updateCartQuantity(cartId, quantity) {
  const sql = `
    UPDATE public.shopping_cart
    SET quantity = $1
    WHERE cart_id = $2
    RETURNING *
  `;
  try {
    const result = await pool.query(sql, [Number(quantity), Number(cartId)]);
    return result.rows[0];
  } catch (error) {
    const dbError = new Error("Unable to update cart quantity. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

async function removeFromCart(cartId) {
  const sql = `
    DELETE FROM public.shopping_cart
    WHERE cart_id = $1
    RETURNING *
  `;
  try {
    const result = await pool.query(sql, [Number(cartId)]);
    return result.rows[0];
  } catch (error) {
    const dbError = new Error("Unable to remove item from cart. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

async function clearCart(accountId) {
  const sql = `
    DELETE FROM public.shopping_cart
    WHERE account_id = $1
  `;
  try {
    await pool.query(sql, [Number(accountId)]);
    return true;
  } catch (error) {
    const dbError = new Error("Unable to clear cart. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

module.exports = {
  getCartByAccountId,
  getCartItem,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};

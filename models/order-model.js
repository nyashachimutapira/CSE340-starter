const pool = require("../database/");

/**
 * Create a new order
 */
async function createOrder(accountId, totalAmount, shippingInfo) {
  const sql = `
    INSERT INTO public.orders (account_id, total_amount, status, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone)
    VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7)
    RETURNING order_id, account_id, order_date, total_amount, status, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_phone
  `;

  const values = [
    Number(accountId),
    parseFloat(totalAmount),
    shippingInfo.address || '',
    shippingInfo.city || '',
    shippingInfo.state || '',
    shippingInfo.zip || '',
    shippingInfo.phone || '',
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Unable to create order. Please try again.");
  }
}

/**
 * Add item to order
 */
async function addOrderItem(orderId, invId, quantity, priceAtPurchase) {
  const sql = `
    INSERT INTO public.order_items (order_id, inv_id, quantity, price_at_purchase)
    VALUES ($1, $2, $3, $4)
    RETURNING order_item_id, order_id, inv_id, quantity, price_at_purchase
  `;

  const values = [
    Number(orderId),
    Number(invId),
    Number(quantity),
    parseFloat(priceAtPurchase),
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding order item:", error);
    throw new Error("Unable to add item to order. Please try again.");
  }
}

/**
 * Get order by ID with items
 */
async function getOrderById(orderId) {
  const sql = `
    SELECT 
      o.order_id, o.account_id, o.order_date, o.total_amount, o.status,
      o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zip, o.shipping_phone,
      o.created_at, o.updated_at
    FROM public.orders o
    WHERE o.order_id = $1
  `;

  try {
    const result = await pool.query(sql, [Number(orderId)]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting order:", error);
    throw new Error("Unable to retrieve order.");
  }
}

/**
 * Get order items
 */
async function getOrderItems(orderId) {
  const sql = `
    SELECT 
      oi.order_item_id, oi.order_id, oi.inv_id, oi.quantity, oi.price_at_purchase,
      i.inv_make, i.inv_model, i.inv_year, i.inv_image, i.inv_thumbnail
    FROM public.order_items oi
    JOIN public.inventory i ON oi.inv_id = i.inv_id
    WHERE oi.order_id = $1
    ORDER BY oi.created_at
  `;

  try {
    const result = await pool.query(sql, [Number(orderId)]);
    return result.rows;
  } catch (error) {
    console.error("Error getting order items:", error);
    throw new Error("Unable to retrieve order items.");
  }
}

/**
 * Get all orders for an account
 */
async function getOrdersByAccountId(accountId) {
  const sql = `
    SELECT 
      o.order_id, o.account_id, o.order_date, o.total_amount, o.status,
      o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zip,
      o.created_at, o.updated_at,
      COUNT(oi.order_item_id) as item_count
    FROM public.orders o
    LEFT JOIN public.order_items oi ON o.order_id = oi.order_id
    WHERE o.account_id = $1
    GROUP BY o.order_id
    ORDER BY o.order_date DESC
  `;

  try {
    const result = await pool.query(sql, [Number(accountId)]);
    return result.rows;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw new Error("Unable to retrieve orders.");
  }
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, status) {
  const sql = `
    UPDATE public.orders
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE order_id = $2
    RETURNING order_id, account_id, order_date, total_amount, status
  `;

  try {
    const result = await pool.query(sql, [status, Number(orderId)]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating order:", error);
    throw new Error("Unable to update order.");
  }
}

module.exports = {
  createOrder,
  addOrderItem,
  getOrderById,
  getOrderItems,
  getOrdersByAccountId,
  updateOrderStatus,
};

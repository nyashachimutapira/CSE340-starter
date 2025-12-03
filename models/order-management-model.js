const pool = require("../database");
const inventoryManagementModel = require("./inventory-management-model");

const orderManagementModel = {};

/**
 * Create order from cart items
 * @param {number} accountId - Account ID
 * @param {Array} cartItems - Cart items from database
 * @returns {Promise<Object>} Created order
 */
orderManagementModel.createOrder = async function createOrder(accountId, cartItems) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.inv_price * item.quantity,
      0
    );

    // Create order
    const orderResult = await client.query(
      "INSERT INTO orders (account_id, total_amount, status) VALUES ($1, $2, 'confirmed') RETURNING order_id, order_date, total_amount",
      [accountId, totalAmount]
    );
    const orderId = orderResult.rows[0].order_id;

    // Add order items and reduce inventory
    for (const item of cartItems) {
      // Check stock first
      const stock = await client.query(
        "SELECT inv_quantity FROM inventory WHERE inv_id = $1",
        [item.inv_id]
      );

      if (!stock.rows[0] || stock.rows[0].inv_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for vehicle ${item.inv_id}. Available: ${stock.rows[0]?.inv_quantity || 0}, Requested: ${item.quantity}`
        );
      }

      // Add order item
      await client.query(
        "INSERT INTO order_items (order_id, inv_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)",
        [orderId, item.inv_id, item.quantity, item.inv_price]
      );

      // Reduce inventory
      await client.query(
        "UPDATE inventory SET inv_quantity = inv_quantity - $1 WHERE inv_id = $2",
        [item.quantity, item.inv_id]
      );
    }

    // Clear cart
    await client.query(
      "DELETE FROM shopping_cart WHERE account_id = $1",
      [accountId]
    );

    await client.query("COMMIT");

    return {
      order_id: orderId,
      total_amount: totalAmount,
      status: "confirmed",
      order_date: orderResult.rows[0].order_date,
      item_count: cartItems.length,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`Error creating order: ${err.message}`);
  } finally {
    client.release();
  }
};

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
orderManagementModel.getOrderById = async function getOrderById(orderId) {
  try {
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1",
      [orderId]
    );

    if (!orderResult.rows[0]) {
      return null;
    }

    const itemsResult = await pool.query(
      "SELECT oi.*, i.inv_make, i.inv_model, i.inv_year, i.inv_image FROM order_items oi JOIN inventory i ON oi.inv_id = i.inv_id WHERE oi.order_id = $1",
      [orderId]
    );

    return {
      ...orderResult.rows[0],
      items: itemsResult.rows,
    };
  } catch (err) {
    throw new Error(`Error fetching order: ${err.message}`);
  }
};

/**
 * Get all orders for account
 * @param {number} accountId - Account ID
 * @returns {Promise<Array>} Orders
 */
orderManagementModel.getOrdersByAccountId = async function getOrdersByAccountId(accountId) {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE account_id = $1 ORDER BY order_date DESC",
      [accountId]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching orders: ${err.message}`);
  }
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated order
 */
orderManagementModel.updateOrderStatus = async function updateOrderStatus(orderId, status) {
  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
      [status, orderId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating order status: ${err.message}`);
  }
};

/**
 * Cancel order and restore inventory
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Cancelled order
 */
orderManagementModel.cancelOrder = async function cancelOrder(orderId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get order items
    const itemsResult = await client.query(
      "SELECT inv_id, quantity FROM order_items WHERE order_id = $1",
      [orderId]
    );

    // Restore inventory
    for (const item of itemsResult.rows) {
      await client.query(
        "UPDATE inventory SET inv_quantity = inv_quantity + $1 WHERE inv_id = $2",
        [item.quantity, item.inv_id]
      );
    }

    // Update order status
    const result = await client.query(
      "UPDATE orders SET status = 'cancelled' WHERE order_id = $1 RETURNING *",
      [orderId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`Error cancelling order: ${err.message}`);
  } finally {
    client.release();
  }
};

/**
 * Get all orders (admin)
 * @param {number} limit - Limit results
 * @param {number} offset - Offset
 * @returns {Promise<Array>} Orders
 */
orderManagementModel.getAllOrders = async function getAllOrders(limit = 50, offset = 0) {
  try {
    const result = await pool.query(
      "SELECT o.*, a.account_firstname, a.account_lastname, a.account_email FROM orders o JOIN account a ON o.account_id = a.account_id ORDER BY o.order_date DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching all orders: ${err.message}`);
  }
};

module.exports = orderManagementModel;

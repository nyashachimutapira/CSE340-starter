const pool = require("../database");

const inventoryManagementModel = {};

/**
 * Get inventory stock level for a vehicle
 * @param {number} invId - Inventory ID
 * @returns {Promise<Object>} Stock information
 */
inventoryManagementModel.getStock = async function getStock(invId) {
  try {
    const result = await pool.query(
      "SELECT inv_id, inv_quantity FROM inventory WHERE inv_id = $1",
      [invId]
    );
    return result.rows[0] || null;
  } catch (err) {
    throw new Error(`Error fetching stock: ${err.message}`);
  }
};

/**
 * Reduce inventory stock after purchase
 * @param {number} invId - Inventory ID
 * @param {number} quantity - Quantity to reduce
 * @returns {Promise<Object>} Updated inventory
 */
inventoryManagementModel.reduceStock = async function reduceStock(invId, quantity) {
  try {
    // Check if enough stock available
    const stock = await this.getStock(invId);
    if (!stock) {
      throw new Error("Vehicle not found");
    }
    if (stock.inv_quantity < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${stock.inv_quantity}, Requested: ${quantity}`
      );
    }

    // Reduce stock
    const result = await pool.query(
      "UPDATE inventory SET inv_quantity = inv_quantity - $1 WHERE inv_id = $2 RETURNING inv_id, inv_quantity",
      [quantity, invId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error reducing stock: ${err.message}`);
  }
};

/**
 * Increase inventory stock (for returns or cancellations)
 * @param {number} invId - Inventory ID
 * @param {number} quantity - Quantity to increase
 * @returns {Promise<Object>} Updated inventory
 */
inventoryManagementModel.increaseStock = async function increaseStock(invId, quantity) {
  try {
    const result = await pool.query(
      "UPDATE inventory SET inv_quantity = inv_quantity + $1 WHERE inv_id = $2 RETURNING inv_id, inv_quantity",
      [quantity, invId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error increasing stock: ${err.message}`);
  }
};

/**
 * Check if item is in stock
 * @param {number} invId - Inventory ID
 * @param {number} quantity - Quantity to check
 * @returns {Promise<Boolean>}
 */
inventoryManagementModel.isInStock = async function isInStock(invId, quantity) {
  try {
    const stock = await this.getStock(invId);
    return stock && stock.inv_quantity >= quantity;
  } catch (err) {
    throw new Error(`Error checking stock: ${err.message}`);
  }
};

/**
 * Get low stock items (optional: for admin alerts)
 * @param {number} threshold - Stock threshold (default: 2)
 * @returns {Promise<Array>} Items below threshold
 */
inventoryManagementModel.getLowStockItems = async function getLowStockItems(threshold = 2) {
  try {
    const result = await pool.query(
      "SELECT inv_id, inv_make, inv_model, inv_year, inv_quantity FROM inventory WHERE inv_quantity <= $1 ORDER BY inv_quantity ASC",
      [threshold]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching low stock items: ${err.message}`);
  }
};

/**
 * Get out of stock items
 * @returns {Promise<Array>} Out of stock items
 */
inventoryManagementModel.getOutOfStockItems = async function getOutOfStockItems() {
  try {
    const result = await pool.query(
      "SELECT inv_id, inv_make, inv_model, inv_year FROM inventory WHERE inv_quantity = 0"
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching out of stock items: ${err.message}`);
  }
};

/**
 * Batch reduce inventory for order
 * @param {Array} items - Array of {invId, quantity}
 * @returns {Promise<Array>} Results of reductions
 */
inventoryManagementModel.batchReduceStock = async function batchReduceStock(items) {
  try {
    const results = [];
    for (const item of items) {
      const result = await this.reduceStock(item.invId, item.quantity);
      results.push(result);
    }
    return results;
  } catch (err) {
    throw new Error(`Error in batch reduce stock: ${err.message}`);
  }
};

module.exports = inventoryManagementModel;

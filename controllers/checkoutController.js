const cartModel = require("../models/cart-model");
const orderManagementModel = require("../models/order-management-model");
const inventoryManagementModel = require("../models/inventory-management-model");
const utilities = require("../utilities");

const checkoutController = {};

/**
 * View checkout page with cart summary
 */
checkoutController.viewCheckout = async function viewCheckout(req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to checkout.");
      }
      return res.redirect("/account/login");
    }

    console.log("Loading checkout for account:", req.account.account_id);
    const cartItems = await cartModel.getCartByAccountId(req.account.account_id);
    console.log("Cart items loaded:", cartItems.length);

    if (cartItems.length === 0) {
      if (req.flash) {
        req.flash("notice", "Your cart is empty. Add items before checkout.");
      }
      return res.redirect("/cart");
    }

    // Calculate total and verify stock
    let total = 0;
    const stockCheckResults = [];

    for (const item of cartItems) {
      console.log("Checking stock for item:", item.inv_id);
      const inStock = await inventoryManagementModel.isInStock(item.inv_id, item.quantity);
      stockCheckResults.push({
        inv_id: item.inv_id,
        inStock,
        requested: item.quantity,
      });
      total += item.inv_price * item.quantity;
    }
    console.log("Checkout total:", total);

    const nav = await utilities.getNav();

    res.render("checkout/view", {
      title: "Checkout",
      nav,
      cartItems,
      total: total.toFixed(2),
      itemCount: cartItems.length,
      account: req.account,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
    });
  } catch (err) {
    console.error("Checkout view error:", err.message);
    console.error("Full error stack:", err);
    if (req.flash) {
      req.flash("error", `Unable to load checkout: ${err.message}`);
    }
    res.redirect("/cart");
  }
};

/**
 * Process checkout and create order
 */
checkoutController.processCheckout = async function processCheckout(req, res) {
  try {
    if (!req.account) {
      return res.status(401).json({
        success: false,
        message: "Please log in to complete purchase.",
        redirect: "/account/login",
      });
    }

    // Get cart items
    const cartItems = await cartModel.getCartByAccountId(req.account.account_id);

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // Verify all items are in stock
    for (const item of cartItems) {
      const inStock = await inventoryManagementModel.isInStock(item.inv_id, item.quantity);
      if (!inStock) {
        return res.status(400).json({
          success: false,
          message: `${item.inv_year} ${item.inv_make} ${item.inv_model} is out of stock or insufficient quantity.`,
        });
      }
    }

    // Create order (which handles inventory reduction and cart clearing)
    const order = await orderManagementModel.createOrder(req.account.account_id, cartItems);

    if (req.flash) {
      req.flash(
        "success",
        `Order #${order.order_id} confirmed! Thank you for your purchase.`
      );
    }

    res.json({
      success: true,
      message: "Order created successfully.",
      order_id: order.order_id,
      redirect: `/checkout/confirmation/${order.order_id}`,
    });
  } catch (err) {
    console.error("Checkout process error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Unable to process order. Please try again.",
    });
  }
};

/**
 * View order confirmation
 */
checkoutController.viewConfirmation = async function viewConfirmation(req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to view order confirmation.");
      }
      return res.redirect("/account/login");
    }

    const { orderId } = req.params;
    const order = await orderManagementModel.getOrderById(orderId);

    if (!order) {
      if (req.flash) {
        req.flash("error", "Order not found.");
      }
      return res.redirect("/cart");
    }

    // Verify order belongs to logged-in user
    if (order.account_id !== req.account.account_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const nav = await utilities.getNav();

    res.render("checkout/confirmation", {
      title: "Order Confirmation",
      nav,
      order,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
    });
  } catch (err) {
    console.error("Confirmation view error:", err);
    if (req.flash) {
      req.flash("error", "Unable to load confirmation. Please try again.");
    }
    res.redirect("/cart");
  }
};

/**
 * View order history
 */
checkoutController.viewOrderHistory = async function viewOrderHistory(req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to view order history.");
      }
      return res.redirect("/account/login");
    }

    const orders = await orderManagementModel.getOrdersByAccountId(req.account.account_id);
    const nav = await utilities.getNav();

    res.render("checkout/order-history", {
      title: "Order History",
      nav,
      orders,
      account: req.account,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
    });
  } catch (err) {
    console.error("Order history view error:", err);
    if (req.flash) {
      req.flash("error", "Unable to load order history. Please try again.");
    }
    res.redirect("/");
  }
};

/**
 * Get inventory stock status (for cart page warning)
 */
checkoutController.getStockStatus = async function getStockStatus(req, res) {
  try {
    const { invId } = req.params;
    const stock = await inventoryManagementModel.getStock(invId);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.json({
      success: true,
      inv_id: stock.inv_id,
      stock: stock.inv_quantity,
      in_stock: stock.inv_quantity > 0,
    });
  } catch (err) {
    console.error("Stock status error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch stock status.",
    });
  }
};

module.exports = checkoutController;

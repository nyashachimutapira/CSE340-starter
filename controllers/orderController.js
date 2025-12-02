const cartModel = require("../models/cart-model");
const orderModel = require("../models/order-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const orderController = {};

/**
 * Display checkout page
 */
orderController.buildCheckout = async function (req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to checkout.");
      }
      return res.redirect("/account/login");
    }

    const nav = await utilities.getNav();
    const cartItems = await cartModel.getCartByAccountId(req.account.account_id);

    if (cartItems.length === 0) {
      if (req.flash) {
        req.flash("notice", "Your cart is empty. Add items before checking out.");
      }
      return res.redirect("/cart");
    }

    let total = 0;
    cartItems.forEach(item => {
      total += item.inv_price * item.quantity;
    });

    res.render("order/checkout", {
      title: "Checkout",
      nav,
      cartItems,
      total: total.toFixed(2),
      itemCount: cartItems.length,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
      account: req.account,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to load checkout. Please try again.",
    });
  }
};

/**
 * Process order
 */
orderController.placeOrder = async function (req, res) {
  try {
    if (!req.account) {
      return res.status(401).json({
        success: false,
        message: "Please log in to place an order.",
        redirect: "/account/login",
      });
    }

    const { address, city, state, zip, phone } = req.body;

    // Validate shipping info
    if (!address || !city || !state || !zip || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping information.",
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

    // Calculate total
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.inv_price * item.quantity;
    });

    // Create order
    const order = await orderModel.createOrder(
      req.account.account_id,
      totalAmount,
      { address, city, state, zip, phone }
    );

    // Add items to order
    for (const item of cartItems) {
      await orderModel.addOrderItem(
        order.order_id,
        item.inv_id,
        item.quantity,
        item.inv_price
      );
    }

    // Clear cart
    await cartModel.clearCart(req.account.account_id);

    if (req.flash) {
      req.flash("success", "Order placed successfully!");
    }

    res.json({
      success: true,
      message: "Order placed successfully!",
      orderId: order.order_id,
      redirect: `/order/confirmation/${order.order_id}`,
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unable to place order. Please try again.",
    });
  }
};

/**
 * Display order confirmation
 */
orderController.buildConfirmation = async function (req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to view your order.");
      }
      return res.redirect("/account/login");
    }

    const orderId = req.params.orderId;
    const order = await orderModel.getOrderById(orderId);

    if (!order || order.account_id !== req.account.account_id) {
      return res.status(403).render("error", {
        title: "Error",
        message: "Order not found or you don't have permission to view it.",
      });
    }

    const orderItems = await orderModel.getOrderItems(orderId);
    const nav = await utilities.getNav();

    res.render("order/confirmation", {
      title: "Order Confirmation",
      nav,
      order,
      orderItems,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
    });
  } catch (error) {
    console.error("Confirmation error:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to load order confirmation.",
    });
  }
};

/**
 * Display order history
 */
orderController.buildOrderHistory = async function (req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to view your orders.");
      }
      return res.redirect("/account/login");
    }

    const orders = await orderModel.getOrdersByAccountId(req.account.account_id);
    const nav = await utilities.getNav();

    res.render("order/history", {
      title: "Order History",
      nav,
      orders,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
    });
  } catch (error) {
    console.error("Order history error:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to load order history.",
    });
  }
};

/**
 * Get order details (JSON API)
 */
orderController.getOrderDetails = async function (req, res) {
  try {
    if (!req.account) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orderId = req.params.orderId;
    const order = await orderModel.getOrderById(orderId);

    if (!order || order.account_id !== req.account.account_id) {
      return res.status(403).json({
        success: false,
        message: "Order not found",
      });
    }

    const orderItems = await orderModel.getOrderItems(orderId);

    res.json({
      success: true,
      order,
      items: orderItems,
    });
  } catch (error) {
    console.error("Error getting order details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unable to get order details.",
    });
  }
};

module.exports = orderController;

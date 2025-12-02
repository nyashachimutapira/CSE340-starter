const cartModel = require("../models/cart-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const cartController = {};

cartController.viewCart = async function viewCart(req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to view your cart.");
      }
      return res.redirect("/account/login");
    }

    const cartItems = await cartModel.getCartByAccountId(req.account.account_id);
    const nav = await utilities.getNav();
    
    let total = 0;
    cartItems.forEach(item => {
      total += item.inv_price * item.quantity;
    });

    res.render("cart/view", {
      title: "Shopping Cart",
      nav,
      cartItems,
      total: total.toFixed(2),
      itemCount: cartItems.length,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
    });
  } catch (err) {
    console.error("Cart view error:", err);
    if (req.flash) {
      req.flash("error", "Unable to load your cart. Please try again.");
    }
    res.redirect("/");
  }
};

cartController.addToCart = async function addToCart(req, res) {
  try {
    if (!req.account) {
      // If it's a JSON request (from fetch), return JSON response
      if (req.accepts('json')) {
        return res.status(401).json({
          success: false,
          message: "Please log in to add items to your cart.",
          redirect: "/account/login"
        });
      }
      // Otherwise redirect (for form submissions)
      if (req.flash) {
        req.flash("notice", "Please log in to add items to your cart.");
      }
      return res.redirect("/account/login");
    }

    const { invId, quantity = 1 } = req.body;

    if (!invId || Number(invId) <= 0 || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item or quantity.",
      });
    }

    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    await cartModel.addToCart(req.account.account_id, invId, quantity);
    if (req.flash) {
      req.flash("success", `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} added to cart.`);
    }

    res.json({
      success: true,
      message: "Item added to cart.",
      redirect: "/cart",
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Unable to add item to cart.",
    });
  }
};

cartController.updateQuantity = async function updateQuantity(req, res) {
  try {
    if (!req.account) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { cartId, quantity } = req.body;

    if (!cartId || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart ID or quantity.",
      });
    }

    const updated = await cartModel.updateCartQuantity(cartId, quantity);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    res.json({
      success: true,
      message: "Quantity updated.",
      item: updated,
    });
  } catch (err) {
    console.error("Update quantity error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to update quantity.",
    });
  }
};

cartController.removeItem = async function removeItem(req, res) {
  try {
    if (!req.account) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { cartId } = req.body;

    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart ID.",
      });
    }

    await cartModel.removeFromCart(cartId);
    if (req.flash) {
      req.flash("success", "Item removed from cart.");
    }

    res.json({
      success: true,
      message: "Item removed from cart.",
    });
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to remove item from cart.",
    });
  }
};

cartController.clearCart = async function clearCart(req, res) {
  try {
    if (!req.account) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await cartModel.clearCart(req.account.account_id);
    if (req.flash) {
      req.flash("success", "Cart cleared.");
    }

    res.json({
      success: true,
      message: "Cart cleared.",
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to clear cart.",
    });
  }
};

module.exports = cartController;

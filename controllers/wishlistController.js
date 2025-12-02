const wishlistModel = require("../models/wishlist-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const wishlistController = {};

wishlistController.viewWishlist = async function viewWishlist(req, res) {
  try {
    if (!req.account) {
      if (req.flash) {
        req.flash("notice", "Please log in to view your wishlist.");
      }
      return res.redirect("/account/login");
    }

    const wishlistItems = await wishlistModel.getWishlistByAccountId(req.account.account_id);
    const nav = await utilities.getNav();

    res.render("wishlist/view", {
      title: "My Wishlist",
      nav,
      wishlistItems,
      itemCount: wishlistItems.length,
      notices: (req.flash && req.flash("notice")) || [],
      errors: (req.flash && req.flash("error")) || [],
      success: (req.flash && req.flash("success")) || [],
    });
  } catch (err) {
    console.error("Wishlist view error:", err);
    if (req.flash) {
      req.flash("error", "Unable to load your wishlist. Please try again.");
    }
    res.redirect("/");
  }
};

wishlistController.addToWishlist = async function addToWishlist(req, res) {
  try {
    if (!req.account) {
      // If it's a JSON request (from fetch), return JSON response
      if (req.accepts('json')) {
        return res.status(401).json({
          success: false,
          message: "Please log in to add items to your wishlist.",
          redirect: "/account/login"
        });
      }
      // Otherwise redirect (for form submissions)
      if (req.flash) {
        req.flash("notice", "Please log in to add items to your wishlist.");
      }
      return res.redirect("/account/login");
    }

    const { invId } = req.body;

    if (!invId || Number(invId) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    const existingItem = await wishlistModel.getWishlistItem(req.account.account_id, invId);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "This item is already in your wishlist.",
      });
    }

    await wishlistModel.addToWishlist(req.account.account_id, invId);
    if (req.flash) {
      req.flash("success", `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} added to wishlist.`);
    }

    res.json({
      success: true,
      message: "Item added to wishlist.",
      redirect: "/wishlist",
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Unable to add item to wishlist.",
    });
  }
};

wishlistController.removeFromWishlist = async function removeFromWishlist(req, res) {
  try {
    if (!req.account) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { wishlistId } = req.body;

    if (!wishlistId) {
      return res.status(400).json({
        success: false,
        message: "Invalid wishlist ID.",
      });
    }

    await wishlistModel.removeFromWishlist(wishlistId);
    if (req.flash) {
      req.flash("success", "Item removed from wishlist.");
    }

    res.json({
      success: true,
      message: "Item removed from wishlist.",
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to remove item from wishlist.",
    });
  }
};

module.exports = wishlistController;

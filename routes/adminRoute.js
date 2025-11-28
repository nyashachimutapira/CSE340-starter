const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const utilities = require("../utilities");

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  utilities.requireAuth(req, res, () => {
    if (req.account.account_type === "Admin") {
      next();
    } else {
      req.flash("notice", "You are not authorized to access this resource.");
      res.redirect("/account/");
    }
  });
};

// Admin dashboard - main reporting page
router.get(
  "/dashboard",
  requireAdmin,
  utilities.handleErrors(adminController.buildDashboard)
);

// Users management list
router.get(
  "/users",
  requireAdmin,
  utilities.handleErrors(adminController.buildUsersList)
);

// Activity log
router.get(
  "/activity",
  requireAdmin,
  utilities.handleErrors(adminController.buildActivityLog)
);

// JSON API for dashboard data (for AJAX updates)
router.get(
  "/api/dashboard-data",
  requireAdmin,
  utilities.handleErrors(adminController.getDashboardDataJSON)
);

module.exports = router;

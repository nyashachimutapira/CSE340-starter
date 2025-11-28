const utilities = require("../utilities");
const adminModel = require("../models/admin-model");
const profileModel = require("../models/profile-model");

const adminController = {};

/**
 * Build admin dashboard with reporting
 */
adminController.buildDashboard = async function (req, res) {
  const nav = await utilities.getNav();
  
  try {
    // Gather all dashboard data
    const totalAccounts = await adminModel.getTotalAccounts();
    const accountsByType = await adminModel.getAccountsByType();
    const newAccountsTrend = await adminModel.getNewAccountsTrend(30);
    const profileStats = await adminModel.getProfileCompletionStats();
    const activitySummary = await adminModel.getActivitySummary(30);
    const activityTrend = await adminModel.getActivityTrend(30);
    const recentActivities = await adminModel.getAdminActivities(10, 0);
    
    // Prepare data for charts
    const accountTypeData = {
      labels: accountsByType.map(a => a.account_type || "Unknown"),
      data: accountsByType.map(a => a.count),
    };
    
    const newAccountsData = {
      labels: newAccountsTrend.map(t => t.date),
      data: newAccountsTrend.map(t => t.new_accounts),
    };
    
    const activityData = {
      labels: activityTrend.map(t => t.date),
      data: activityTrend.map(t => t.activity_count),
    };
    
    const profileCompletionData = {
      completed: profileStats.profiles_created || 0,
      incomplete: Math.max(0, totalAccounts - (profileStats.profiles_created || 0)),
    };
    
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      nav,
      errors: null,
      totalAccounts,
      accountsByType,
      profileStats,
      activitySummary,
      recentActivities,
      accountTypeData,
      newAccountsData,
      activityData,
      profileCompletionData,
    });
  } catch (error) {
    console.error("Error building admin dashboard:", error);
    res.status(500).render("error", {
      title: "Error",
      nav,
      message: "Unable to load dashboard",
    });
  }
};

/**
 * Build admin users list
 */
adminController.buildUsersList = async function (req, res) {
  const nav = await utilities.getNav();
  
  try {
    const users = await profileModel.getAllUsersWithProfiles();
    
    res.render("admin/users-list", {
      title: "Users Management",
      nav,
      errors: null,
      users,
    });
  } catch (error) {
    console.error("Error building users list:", error);
    res.status(500).render("error", {
      title: "Error",
      nav,
      message: "Unable to load users list",
    });
  }
};

/**
 * Build activity log view
 */
adminController.buildActivityLog = async function (req, res) {
  const nav = await utilities.getNav();
  const page = parseInt(req.query.page) || 1;
  const pageSize = 25;
  const offset = (page - 1) * pageSize;
  
  try {
    const activities = await adminModel.getAdminActivities(pageSize, offset);
    
    res.render("admin/activity-log", {
      title: "Admin Activity Log",
      nav,
      errors: null,
      activities,
      currentPage: page,
      pageSize,
    });
  } catch (error) {
    console.error("Error building activity log:", error);
    res.status(500).render("error", {
      title: "Error",
      nav,
      message: "Unable to load activity log",
    });
  }
};

/**
 * Get dashboard data as JSON for AJAX requests
 */
adminController.getDashboardDataJSON = async function (req, res) {
  try {
    const totalAccounts = await adminModel.getTotalAccounts();
    const accountsByType = await adminModel.getAccountsByType();
    const newAccountsTrend = await adminModel.getNewAccountsTrend(30);
    const profileStats = await adminModel.getProfileCompletionStats();
    const activitySummary = await adminModel.getActivitySummary(30);
    
    res.json({
      success: true,
      data: {
        totalAccounts,
        accountsByType,
        newAccountsTrend,
        profileStats,
        activitySummary,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
};

module.exports = adminController;

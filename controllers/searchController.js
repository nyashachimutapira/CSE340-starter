const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const searchController = {};

/**
 * Build search page with filter form
 */
searchController.buildSearchPage = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    
    // Get all vehicles to extract unique values for filter dropdowns
    const allVehicles = await invModel.searchInventory({});
    const makes = [...new Set(allVehicles.map(v => v.inv_make))].sort();
    const colors = [...new Set(allVehicles.map(v => v.inv_color))].sort();
    const years = [...new Set(allVehicles.map(v => v.inv_year))].sort().reverse();

    res.render("search/search", {
      title: "Search Vehicles",
      nav,
      classifications,
      results: [],
      filters: {},
      resultCount: 0,
      makes,
      colors,
      years,
    });
  } catch (error) {
    console.error("Error building search page:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to load search page",
    });
  }
};

/**
 * Process search with filters
 */
searchController.performSearch = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();

    // Extract filter parameters
    const filters = {
      keyword: req.query.keyword || "",
      classification: req.query.classification || 0,
      year: req.query.year || 0,
      make: req.query.make || "",
      color: req.query.color || "",
      minPrice: req.query.minPrice || 0,
      maxPrice: req.query.maxPrice || 0,
      maxMiles: req.query.maxMiles || 0,
      sortBy: req.query.sortBy || "make",
    };

    // Perform search
    const results = await invModel.searchInventory(filters);

    // Get unique makes for filter dropdown
    const allVehicles = await invModel.searchInventory({});
    const makes = [...new Set(allVehicles.map(v => v.inv_make))].sort();
    const colors = [...new Set(allVehicles.map(v => v.inv_color))].sort();
    const years = [...new Set(allVehicles.map(v => v.inv_year))].sort().reverse();

    res.render("search/search", {
      title: "Search Vehicles",
      nav,
      classifications,
      results,
      filters,
      resultCount: results.length,
      makes,
      colors,
      years,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Error performing search. Please try again.",
    });
  }
};

module.exports = searchController;

const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// Display search page
router.get("/", searchController.buildSearchPage);

// Perform search with filters
router.get("/results", searchController.performSearch);

module.exports = router;

const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");

router.get(
  "/trigger",
  utilities.handleErrors(errorController.triggerServerError)
);

module.exports = router;


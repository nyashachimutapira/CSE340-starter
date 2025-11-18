const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const utilities = require("../utilities");

router.get(
  "/type/:classificationId",
  utilities.handleErrors(inventoryController.buildClassificationView)
);

router.get(
  "/detail/:invId",
  utilities.handleErrors(inventoryController.buildVehicleDetail)
);

module.exports = router;


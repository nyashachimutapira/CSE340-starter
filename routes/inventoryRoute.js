const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const utilities = require("../utilities");
const validation = require("../utilities/validation");

router.get("/", utilities.handleErrors(inventoryController.buildManagementView));

router.get(
  "/add-classification",
  utilities.handleErrors(inventoryController.buildAddClassificationView)
);

router.post(
  "/add-classification",
  validation.classificationRules(),
  validation.checkClassificationData,
  utilities.handleErrors(inventoryController.addClassification)
);

router.get(
  "/add-inventory",
  utilities.handleErrors(inventoryController.buildAddInventoryView)
);

router.post(
  "/add-inventory",
  validation.inventoryRules(),
  validation.checkInventoryData,
  utilities.handleErrors(inventoryController.addInventory)
);

router.get(
  "/type/:classificationId",
  utilities.handleErrors(inventoryController.buildClassificationView)
);

router.get(
  "/detail/:invId",
  utilities.handleErrors(inventoryController.buildVehicleDetail)
);

module.exports = router;


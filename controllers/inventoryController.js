const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const inventoryController = {};

inventoryController.buildClassificationView = async function buildClassificationView(req, res) {
  const classificationId = Number(req.params.classificationId);
  const [nav, classification, inventory] = await Promise.all([
    utilities.getNav(classificationId),
    invModel.getClassificationById(classificationId),
    invModel.getInventoryByClassificationId(classificationId),
  ]);

  if (!classification) {
    const error = new Error("Classification not found.");
    error.status = 404;
    throw error;
  }

  const grid = utilities.buildClassificationGrid(inventory);
  res.render("inventory/classification", {
    title: `${classification.classification_name} Vehicles`,
    heading: `${classification.classification_name} Vehicles`,
    nav,
    grid,
  });
};

inventoryController.buildVehicleDetail = async function buildVehicleDetail(req, res) {
  const invId = Number(req.params.invId);
  const vehicle = await invModel.getInventoryById(invId);

  if (!vehicle) {
    const error = new Error("Sorry, that vehicle could not be found.");
    error.status = 404;
    throw error;
  }

  const nav = await utilities.getNav(vehicle.classification_id);
  const detail = utilities.buildVehicleDetail(vehicle);
  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;

  res.render("inventory/detail", {
    title,
    heading: title,
    nav,
    detail,
  });
};

module.exports = inventoryController;


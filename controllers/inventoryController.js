const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");
const ratingModel = require("../models/rating-model");
const utilities = require("../utilities");

const inventoryController = {};

inventoryController.buildManagementView = async function buildManagementView(req, res) {
  const nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
  });
};

inventoryController.buildAddClassificationView = async function buildAddClassificationView(req, res) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
  });
};

inventoryController.addClassification = async function addClassification(req, res) {
  const { classification_name } = req.body;

  try {
    const newClassification = await invModel.createClassification(classification_name);
    req.flash("success", `${newClassification.classification_name} classification added successfully.`);
    res.redirect("/inv");
  } catch (err) {
    const message = err.message || "Sorry, we could not add that classification.";
    const nav = await utilities.getNav();
    req.flash("error", message);
    res.status(err.status || 500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [{ msg: message }],
      classification_name,
    });
  }
};

inventoryController.buildAddInventoryView = async function buildAddInventoryView(req, res) {
  const [nav, classificationList] = await Promise.all([utilities.getNav(), utilities.buildClassificationList()]);
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
  });
};

inventoryController.addInventory = async function addInventory(req, res) {
  try {
    const newVehicle = await invModel.createVehicle(req.body);
    req.flash("success", `Successfully added the ${newVehicle.inv_year} ${newVehicle.inv_make} ${newVehicle.inv_model}.`);
    res.redirect("/inv");
  } catch (err) {
    const message = err.message || "Sorry, we could not add that vehicle.";
    const [nav, classificationList] = await Promise.all([
      utilities.getNav(),
      utilities.buildClassificationList(req.body.classification_id),
    ]);

    req.flash("error", message);
    res.status(err.status || 500).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: [{ msg: message }],
      ...req.body,
    });
  }
};

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
  const detail = utilities.buildVehicleDetail(vehicle, req.account);
  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;

  // Try to load recent reviews and average rating; if tables are missing, continue gracefully
  let reviews = [];
  let average = 0;
  let review_count = 0;
  try {
    const [revRows, avg] = await Promise.all([
      reviewModel.getReviewsByInv(vehicle.inv_id),
      ratingModel.getAverageRating(vehicle.inv_id),
    ]);
    reviews = revRows || [];
    if (avg) {
      average = avg.average_rating || 0;
      review_count = Number(avg.rating_count || 0);
    }
  } catch (err) {
    console.error('Could not load reviews/ratings for detail view:', err && err.message ? err.message : err);
  }

  res.render("inventory/detail", {
    title,
    heading: title,
    nav,
    detail,
    inv_id: vehicle.inv_id,
    reviews,
    average,
    review_count,
  });
};

module.exports = inventoryController;


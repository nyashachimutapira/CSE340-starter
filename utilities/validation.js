const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validation = {};

validation.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Please provide a classification name.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name cannot contain spaces or special characters.")
    .isLength({ min: 3 })
    .withMessage("Classification name must be at least 3 characters long."),
];

validation.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      errors: errors.array(),
      classification_name: req.body.classification_name,
    });
  }
  next();
};

validation.inventoryRules = () => [
  body("classification_id")
    .trim()
    .notEmpty()
    .withMessage("Please choose a classification."),
  body("inv_make").trim().notEmpty().withMessage("Please provide the vehicle make."),
  body("inv_model").trim().notEmpty().withMessage("Please provide the vehicle model."),
  body("inv_year")
    .trim()
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage("Provide a valid four-digit year."),
  body("inv_price").trim().isFloat({ min: 0 }).withMessage("Provide a valid price."),
  body("inv_miles")
    .trim()
    .isInt({ min: 0 })
    .withMessage("Mileage must be a whole number zero or greater."),
  body("inv_color").trim().notEmpty().withMessage("Please provide the color."),
  body("inv_image").trim().notEmpty().withMessage("Provide an image path for the vehicle."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Provide a thumbnail image path."),
  body("inv_description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Please provide a description of at least 10 characters."),
];

validation.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);

    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      errors: errors.array(),
      classificationList,
      ...req.body,
    });
  }

  next();
};

module.exports = validation;


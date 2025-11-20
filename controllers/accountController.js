const utilities = require("../utilities");

const accountController = {};

/**
 * Build the login view.
 */
accountController.buildLogin = async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Account Login",
    nav,
    errors: null,
  });
};

/**
 * Build the registration view.
 */
accountController.buildRegister = async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Create Account",
    nav,
    errors: null,
  });
};

/**
 * Placeholder for future login processing.
 */
accountController.processLogin = async function processLogin(req, res) {
  req.flash("info", "Login processing is not available yet.");
  res.redirect("/account/login");
};

/**
 * Placeholder for future registration processing.
 */
accountController.processRegistration = async function processRegistration(req, res) {
  req.flash("info", "Registration processing is not available yet.");
  res.redirect("/account/register");
};

module.exports = accountController;



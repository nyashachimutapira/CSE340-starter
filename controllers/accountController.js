const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");

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
  const { account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  try {
    const account = await accountModel.getAccountByEmail(account_email);

    if (!account) {
      return res.status(400).render("account/login", {
        title: "Account Login",
        nav,
        errors: [{ msg: "The email and password combination was not found." }],
        account_email,
      });
    }

    const passwordMatches = await bcrypt.compare(account_password, account.account_password);
    if (!passwordMatches) {
      return res.status(400).render("account/login", {
        title: "Account Login",
        nav,
        errors: [{ msg: "The email and password combination was not found." }],
        account_email,
      });
    }

    const tokenPayload = utilities.buildAuthPayload(account);
    const accessToken = utilities.generateJWT(tokenPayload);
    utilities.attachAuthCookie(res, accessToken);

    req.flash("success", `Welcome back, ${account.account_firstname}!`);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).render("account/login", {
      title: "Account Login",
      nav,
      errors: [{ msg: "Unexpected error logging in. Please try again." }],
      account_email,
    });
  }
};

/**
 * Placeholder for future registration processing.
 */
accountController.processRegistration = async function processRegistration(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    await accountModel.createAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_password: hashedPassword,
    });

    req.flash("success", `Congratulations, ${account_firstname}. Please log in.`);
    res.redirect("/account/login");
  } catch (err) {
    console.error(err);
    let message = "Sorry, we could not register you at this time.";
    if (err.code === "23505") {
      message = "That email address is already registered. Please log in instead.";
    }

    res.status(err.status || 500).render("account/register", {
      title: "Create Account",
      nav,
      errors: [{ msg: message }],
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

accountController.logout = function logout(req, res) {
  utilities.clearAuthCookie(res);
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
};

module.exports = accountController;



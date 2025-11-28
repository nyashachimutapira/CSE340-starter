const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const profileController = require("../controllers/profileController");
const utilities = require("../utilities");
const accountValidate = require("../utilities/account-validation");

router.get(
  "/",
  utilities.requireAuth,
  utilities.handleErrors(accountController.buildManagement)
);

router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.processLogin)
);

router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.processRegistration)
);

router.get(
  "/update/:accountId",
  utilities.requireAuth,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

router.post(
  "/update",
  utilities.requireAuth,
  accountValidate.updateAccountRules(),
  accountValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

router.post(
  "/change-password",
  utilities.requireAuth,
  accountValidate.changePasswordRules(),
  accountValidate.checkPasswordData,
  utilities.handleErrors(accountController.changePassword)
);

router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
);

// Profile routes
router.get(
  "/profile",
  utilities.requireAuth,
  utilities.handleErrors(profileController.buildViewProfile)
);

router.get(
  "/profile/edit",
  utilities.requireAuth,
  utilities.handleErrors(profileController.buildEditProfile)
);

router.post(
  "/profile/update",
  utilities.requireAuth,
  utilities.handleErrors(profileController.updateProfile)
);

module.exports = router;



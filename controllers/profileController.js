const utilities = require("../utilities");
const profileModel = require("../models/profile-model");
const accountModel = require("../models/account-model");

const profileController = {};

/**
 * Build view profile page
 */
profileController.buildViewProfile = async function (req, res) {
  const nav = await utilities.getNav();
  const account_id = req.account.account_id;
  
  try {
    const account = await accountModel.getAccountById(account_id);
    let profile = await profileModel.getProfileByAccountId(account_id);
    
    // If profile doesn't exist, initialize it
    if (!profile) {
      profile = await profileModel.initializeProfile(account_id);
    }
    
    res.render("account/view-profile", {
      title: "My Profile",
      nav,
      errors: null,
      account,
      profile,
    });
  } catch (error) {
    console.error("Error building profile view:", error);
    res.status(500).render("error", {
      title: "Error",
      nav,
      message: "Unable to load profile",
    });
  }
};

/**
 * Build edit profile page
 */
profileController.buildEditProfile = async function (req, res) {
  const nav = await utilities.getNav();
  const account_id = req.account.account_id;
  
  try {
    const account = await accountModel.getAccountById(account_id);
    let profile = await profileModel.getProfileByAccountId(account_id);
    
    // If profile doesn't exist, initialize it
    if (!profile) {
      profile = await profileModel.initializeProfile(account_id);
    }
    
    res.render("account/edit-profile", {
      title: "Edit Profile",
      nav,
      errors: null,
      account,
      profile,
    });
  } catch (error) {
    console.error("Error building edit profile view:", error);
    res.status(500).render("error", {
      title: "Error",
      nav,
      message: "Unable to load profile",
    });
  }
};

/**
 * Process profile update
 */
profileController.updateProfile = async function (req, res) {
  const nav = await utilities.getNav();
  const account_id = req.account.account_id;
  const { bio, phone_number, address, profile_picture } = req.body;
  
  try {
    // Validate inputs
    if (phone_number && !/^[\d\s\-\+\(\)]*$/.test(phone_number)) {
      return res.status(400).render("account/edit-profile", {
        title: "Edit Profile",
        nav,
        errors: [{ msg: "Invalid phone number format" }],
        account: req.account,
        profile: { bio, phone_number, address, profile_picture },
      });
    }
    
    // Check if profile exists
    let profile = await profileModel.getProfileByAccountId(account_id);
    
    if (!profile) {
      // Create new profile
      profile = await profileModel.createProfile(account_id, bio, phone_number, address, profile_picture);
    } else {
      // Update existing profile
      profile = await profileModel.updateProfile(account_id, bio, phone_number, address, profile_picture);
    }
    
    req.flash("success", "Profile updated successfully!");
    res.redirect("/account/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    const account = await accountModel.getAccountById(account_id);
    res.status(500).render("account/edit-profile", {
      title: "Edit Profile",
      nav,
      errors: [{ msg: "Error updating profile. Please try again." }],
      account,
      profile: { bio, phone_number, address, profile_picture },
    });
  }
};

module.exports = profileController;

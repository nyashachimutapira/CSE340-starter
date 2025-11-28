/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
require("dotenv").config(); // no need to assign to a variable
// Don't log DATABASE_URL as it contains sensitive credentials
if (process.env.NODE_ENV !== "production") {
  console.log("Database connection configured");
}
const app = express();
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const adminRoute = require("./routes/adminRoute");
const errorRoute = require("./routes/errorRoute");
const cartRoute = require("./routes/cartRoute");
const wishlistRoute = require("./routes/wishlistRoute");
const utilities = require("./utilities");
const pool = require("./database/");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Middleware
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(staticRoutes);
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET || "cse340_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    name: "sessionId",
  })
);
app.use(flash());
app.use(utilities.checkJWTToken);

app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    res.locals.notice = req.flash("notice");
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
  } catch (err) {
    // If nav fails, provide a fallback so the app doesn't crash
    console.error("Navigation error:", err.message);
    res.locals.nav = '<ul id="primary-nav"><li><a href="/">Home</a></li></ul>';
    res.locals.notice = req.flash("notice");
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
  }
});

/* ***********************
 * Routes
 *************************/
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/admin", adminRoute);
app.use("/error", errorRoute);
app.use("/cart", cartRoute);
app.use("/wishlist", wishlistRoute);

// Index route
app.get(
  "/",
  utilities.handleErrors(async function buildHomeView(req, res) {
    const nav = await utilities.getNav("home");
    res.render("index", { title: "Home", nav });
  })
);

/* ***********************
 * Error Handling
 *************************/
app.use((req, res, next) => {
  const error = new Error("Sorry, the page you requested was not found.");
  error.status = 404;
  next(error);
});

app.use(async (err, req, res, next) => {
  try {
    console.error(err);
    const status = err.status || 500;
    // Safely get nav, but don't fail if database is unavailable
    let nav = '<ul id="primary-nav"><li><a href="/">Home</a></li></ul>';
    try {
      nav = await utilities.getNav();
    } catch (navError) {
      console.error("Failed to load navigation:", navError.message);
    }
    res.status(status).render("error", {
      title: `${status} Error`,
      nav,
      statusCode: status,
      message: err.message || "An unexpected error occurred.",
    });
  } catch (error) {
    // Last resort: send plain text if rendering fails
    console.error("Critical error in error handler:", error);
    res.status(500).send("An unexpected error occurred. Please try again later.");
  }
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file or default
 * Render automatically sets PORT, so we use that
 *************************/
const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || "0.0.0.0"; // Use 0.0.0.0 for Render compatibility

/* ***********************
 * Start the server
 *************************/
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Local access: http://localhost:${PORT}`);
  }
});

/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config(); // no need to assign to a variable
const app = express();
const static = require("./routes/static");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route
app.get("/", function (req, res) {
  res.render("index", { title: "Home" });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file or default
 *************************/
const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || "localhost";

/* ***********************
 * Start the server
 *************************/
app.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

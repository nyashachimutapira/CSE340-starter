const invModel = require("../models/inventory-model");

const utilities = {};

/**
 * Build the primary navigation element based on the available classifications.
 * @param {number|string|null} activeClassificationId
 * @returns {Promise<string>}
 */
utilities.getNav = async function getNav(activeClassificationId = null) {
  const classifications = await invModel.getClassifications();
  let nav = '<ul id="primary-nav">';
  nav += `<li><a href="/" title="Home page"${activeClassificationId === "home" ? ' class="active"' : ""}>Home</a></li>`;

  classifications
    .filter((classification) => classification.classification_name !== "Classic")
    .forEach((classification) => {
      const isActive =
        Number(activeClassificationId) === classification.classification_id;
      nav += `<li><a href="/inv/type/${classification.classification_id}" title="View our ${classification.classification_name} inventory"${
        isActive ? ' class="active"' : ""
      }>${classification.classification_name}</a></li>`;
    });

  nav += "</ul>";
  return nav;
};

/**
 * Build the HTML grid for a set of vehicles grouped by classification.
 * @param {Array<object>} data
 * @returns {string}
 */
utilities.buildClassificationGrid = function buildClassificationGrid(data = []) {
  if (!Array.isArray(data) || !data.length) {
    return '<p class="notice" role="status">Sorry, no matching inventory could be found.</p>';
  }

  const gridItems = data
    .map((vehicle) => {
      const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
      const price = utilities.formatCurrency(vehicle.inv_price);
      return `<li class="inv-card">
        <a href="/inv/detail/${vehicle.inv_id}" aria-label="View details for the ${title}">
          <figure>
            <img src="${vehicle.inv_thumbnail}" alt="Thumbnail of ${title}">
            <figcaption>
              <p class="vehicle-title">${title}</p>
              <p class="vehicle-price">${price}</p>
            </figcaption>
          </figure>
        </a>
      </li>`;
    })
    .join("");

  return `<ul class="inv-grid">${gridItems}</ul>`;
};

/**
 * Build the HTML for an individual vehicle detail view.
 * @param {object} vehicle
 * @returns {string}
 */
utilities.buildVehicleDetail = function buildVehicleDetail(vehicle) {
  if (!vehicle) {
    return "";
  }

  const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
  const price = utilities.formatCurrency(vehicle.inv_price);
  const miles = utilities.formatNumber(vehicle.inv_miles);

  return `
    <section class="vehicle-detail">
      <div class="vehicle-media">
        <img src="${vehicle.inv_image}" alt="Image of ${title}">
      </div>
      <div class="vehicle-content">
        <p class="vehicle-price">${price}</p>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Make:</strong> ${vehicle.inv_make}</p>
        <p><strong>Model:</strong> ${vehicle.inv_model}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p class="vehicle-description">${vehicle.inv_description}</p>
      </div>
    </section>
  `;
};

/**
 * Format a numeric value as U.S. currency.
 * @param {number} value
 * @returns {string}
 */
utilities.formatCurrency = function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a numeric value with commas.
 * @param {number} value
 * @returns {string}
 */
utilities.formatNumber = function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
};

/**
 * Wrap controller logic with a common error handler.
 * @param {Function} callback
 * @returns {Function}
 */
utilities.handleErrors = function handleErrors(callback) {
  return function wrappedController(req, res, next) {
    Promise.resolve(callback(req, res, next)).catch(next);
  };
};

module.exports = utilities;


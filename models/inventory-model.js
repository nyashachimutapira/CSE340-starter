const pool = require("../database/");

async function getClassifications() {
  const sql = `
    SELECT classification_id, classification_name
    FROM public.classification
    ORDER BY classification_name
  `;
  const result = await pool.query(sql);
  return result.rows;
}

async function getClassificationById(classificationId) {
  const sql = `
    SELECT classification_id, classification_name
    FROM public.classification
    WHERE classification_id = $1
  `;
  const result = await pool.query(sql, [Number(classificationId)]);
  return result.rows[0];
}

async function getInventoryByClassificationId(classificationId) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_description, inv_image,
           inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    FROM public.inventory
    WHERE classification_id = $1
    ORDER BY inv_make, inv_model
  `;
  const result = await pool.query(sql, [Number(classificationId)]);
  return result.rows;
}

async function getInventoryById(invId) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_description, inv_image,
           inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    FROM public.inventory
    WHERE inv_id = $1
  `;
  const result = await pool.query(sql, [Number(invId)]);
  return result.rows[0];
}

async function createClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING classification_id, classification_name
  `;

  try {
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const duplicate = new Error("That classification already exists.");
      duplicate.status = 400;
      throw duplicate;
    }

    const dbError = new Error("Unable to add classification at this time. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

async function createVehicle(vehicleData) {
  const sql = `
    INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
       inv_price, inv_miles, inv_color, classification_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING inv_id, inv_make, inv_model, inv_year, inv_description, inv_image,
              inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  `;

  const values = [
    vehicleData.inv_make,
    vehicleData.inv_model,
    Number(vehicleData.inv_year),
    vehicleData.inv_description,
    vehicleData.inv_image,
    vehicleData.inv_thumbnail,
    Number(vehicleData.inv_price),
    Number(vehicleData.inv_miles),
    vehicleData.inv_color,
    Number(vehicleData.classification_id),
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === "23503") {
      const invalidClassification = new Error("The selected classification does not exist.");
      invalidClassification.status = 400;
      throw invalidClassification;
    }

    const dbError = new Error("Unable to add the vehicle right now. Please try again.");
    dbError.status = 500;
    dbError.cause = error;
    throw dbError;
  }
}

module.exports = {
  getClassifications,
  getClassificationById,
  getInventoryByClassificationId,
  getInventoryById,
  createClassification,
  createVehicle,
};


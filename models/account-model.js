const pool = require("../database/");

async function createAccount({ account_firstname, account_lastname, account_email, account_password }) {
  const sql = `
    INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
    VALUES ($1, $2, $3, $4)
    RETURNING account_id, account_firstname, account_lastname, account_email, account_type
  `;
  const values = [account_firstname, account_lastname, account_email, account_password];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function getAccountByEmail(account_email) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
    FROM public.account
    WHERE account_email = $1
  `;
  const result = await pool.query(sql, [account_email]);
  return result.rows[0];
}

async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type
    FROM public.account
    WHERE account_id = $1
  `;
  const result = await pool.query(sql, [Number(account_id)]);
  return result.rows[0];
}

module.exports = {
  createAccount,
  getAccountByEmail,
  getAccountById,
};



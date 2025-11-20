const { Pool } = require("pg");

/**
 * Create a shared PostgreSQL connection pool that can be reused
 * throughout the application (e.g., for session storage).
 * Connection details are read from environment variables.
 */
const connectionOptions = {};

if (process.env.DATABASE_URL) {
  connectionOptions.connectionString = process.env.DATABASE_URL;
  if (process.env.NODE_ENV === "production") {
    connectionOptions.ssl = { rejectUnauthorized: false };
  }
} else {
  connectionOptions.host = process.env.DB_HOST;
  connectionOptions.port = process.env.DB_PORT;
  connectionOptions.database = process.env.DB_NAME;
  connectionOptions.user = process.env.DB_USER;
  connectionOptions.password = process.env.DB_PASSWORD;

  if (process.env.DB_SSL === "true") {
    connectionOptions.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(connectionOptions);

module.exports = pool;


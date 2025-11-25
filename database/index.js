const { Pool } = require("pg");

/**
 * Create a shared PostgreSQL connection pool that can be reused
 * throughout the application (e.g., for session storage).
 * Connection details are read from environment variables.
 */
const connectionOptions = {};

const appendSslMode = (url) => {
  try {
    const parsed = new URL(url);
    // Fix incomplete Render hostnames (missing .oregon-postgres.render.com)
    if (parsed.hostname && !parsed.hostname.includes(".") && parsed.hostname.startsWith("dpg-")) {
      parsed.hostname = `${parsed.hostname}.oregon-postgres.render.com`;
    }
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, try to fix hostname manually
    if (url.includes("@dpg-") && !url.includes(".oregon-postgres.render.com")) {
      url = url.replace(/@(dpg-[a-z0-9]+)([^:])/, "@$1.oregon-postgres.render.com$2");
    }
    return url.includes("sslmode=") ? url : `${url}?sslmode=require`;
  }
};

if (process.env.DATABASE_URL) {
  const originalUrl = process.env.DATABASE_URL;
  const fixedUrl = appendSslMode(originalUrl);
  if (originalUrl !== fixedUrl && process.env.NODE_ENV !== "production") {
    console.log("Fixed DATABASE_URL hostname:", fixedUrl.replace(/:[^:@]+@/, ":****@"));
  }
  connectionOptions.connectionString = fixedUrl;
} else {
  connectionOptions.host = process.env.DB_HOST;
  connectionOptions.port = process.env.DB_PORT;
  connectionOptions.database = process.env.DB_NAME;
  connectionOptions.user = process.env.DB_USER;
  connectionOptions.password = process.env.DB_PASSWORD;
}

/**
 * Render-hosted PostgreSQL instances (and most other managed providers)
 * require SSL/TLS even for basic connections. Historically this only
 * happened when NODE_ENV was "production", which breaks local development
 * against those managed databases. We now enable SSL by default whenever a
 * DATABASE_URL is provided, unless explicitly disabled. Developers can
 * still force/disable SSL via DB_SSL env var.
 */
const shouldUseSSL = (() => {
  if (process.env.DB_SSL === "true") return true;
  if (process.env.DB_SSL === "false") return false;
  if (process.env.DATABASE_URL) return true;
  if (process.env.NODE_ENV === "production") return true;
  return false;
})();

if (shouldUseSSL) {
  const rejectUnauthorized =
    process.env.DB_SSL_REJECT_UNAUTHORIZED === "true" ? true : false;
  connectionOptions.ssl = { rejectUnauthorized };
}

const pool = new Pool(connectionOptions);

module.exports = pool;


const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runFile(pool, filePath) {
  const sql = fs.readFileSync(filePath, { encoding: 'utf8' });
  // Execute the whole file content; it may contain multiple statements
  await pool.query(sql);
}

async function main() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.error('Please set TEST_DATABASE_URL environment variable to run this script.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  try {
    console.log('Running schema and seed files against test DB...');
    const base = path.join(__dirname, '..', 'database');
    const files = [
      'rebuild.sql',
      'reviews.sql',
      'ratings.sql',
      'favorites.sql',
      'ratings-seed.sql',
      'reviews-seed.sql'
    ];

    for (const f of files) {
      const p = path.join(base, f);
      if (fs.existsSync(p)) {
        console.log('Running', f);
        await runFile(pool, p);
      } else {
        console.warn('File not found, skipping:', p);
      }
    }

    console.log('Test DB setup complete.');
    await pool.end();
  } catch (err) {
    console.error('Error setting up test DB:', err);
    await pool.end();
    process.exit(1);
  }
}

main();

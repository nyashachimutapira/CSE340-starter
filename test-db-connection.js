#!/usr/bin/env node

/**
 * Detailed Database Connection Debugging
 * 
 * This script tests the actual connection string parsing
 * to identify exactly what's wrong.
 */

require('dotenv').config();

console.log('='.repeat(70));
console.log('🔍 Database Connection Debugging');
console.log('='.repeat(70));

const { Pool } = require('pg');

// Get raw DATABASE_URL
const rawUrl = process.env.DATABASE_URL;
console.log('\n1. Raw DATABASE_URL from .env:');
console.log(`   Value: ${rawUrl}`);
console.log(`   Type: ${typeof rawUrl}`);
console.log(`   Length: ${rawUrl?.length}`);

// Try to parse it
console.log('\n2. Parsing connection string:');
try {
  const parsed = new URL(rawUrl);
  console.log('   ✅ URL parsed successfully');
  console.log(`   Protocol: ${parsed.protocol}`);
  console.log(`   Hostname: ${parsed.hostname}`);
  console.log(`   Port: ${parsed.port}`);
  console.log(`   Username: ${parsed.username}`);
  console.log(`   Password: ${parsed.password ? '***HIDDEN***' : 'MISSING'}`);
  console.log(`   Database: ${parsed.pathname}`);
  console.log(`   SSL Mode: ${parsed.searchParams.get('sslmode')}`);
} catch (err) {
  console.log(`   ❌ Failed to parse: ${err.message}`);
}

// Test connection with raw connectionString
console.log('\n3. Testing connection with connectionString property:');
const pool1 = new Pool({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false }
});

pool1.connect((err, client, release) => {
  if (err) {
    console.log(`   ❌ Connection failed: ${err.message}`);
    if (err.detail) console.log(`      Detail: ${err.detail}`);
  } else {
    console.log('   ✅ Connection successful!');
    client.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.log(`   ❌ Query failed: ${err.message}`);
      } else {
        console.log(`   ✅ Query successful: ${result.rows[0].now}`);
      }
      release();
      pool1.end();
      process.exit(0);
    });
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n   ⏱️  Connection timeout - database may be unreachable');
  process.exit(1);
}, 10000);

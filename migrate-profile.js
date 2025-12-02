#!/usr/bin/env node

/**
 * Create User Profile Table
 */

require('dotenv').config();

const pool = require('./database');

async function migrate() {
  console.log('🔄 Creating user_profile table...');

  const sql = `
    CREATE TABLE IF NOT EXISTS public.user_profile (
      profile_id SERIAL PRIMARY KEY,
      account_id INTEGER NOT NULL UNIQUE REFERENCES public.account(account_id) ON DELETE CASCADE,
      bio TEXT,
      phone_number VARCHAR(20),
      address VARCHAR(255),
      profile_picture VARCHAR(500),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS user_profile_account_idx ON public.user_profile(account_id);
  `;

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Split and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    for (const stmt of statements) {
      await client.query(stmt);
      console.log('✅ Executed:', stmt.substring(0, 50) + '...');
    }

    // Verify
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profile'`
    );

    if (result.rows.length > 0) {
      console.log('\n✅ user_profile table created successfully!');
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

migrate();

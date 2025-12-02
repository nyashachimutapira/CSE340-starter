#!/usr/bin/env node

/**
 * Test .env File Loading
 * 
 * This script verifies that the .env file is being loaded correctly
 * and shows you the DATABASE_URL value and type.
 * 
 * Usage: node test-env.js
 */

require('dotenv').config();

console.log('='.repeat(60));
console.log('📋 Environment Variables Test');
console.log('='.repeat(60));

// Check if .env was loaded
console.log('\n1. Checking if .env file is loaded...');
const envPath = require('path').join(__dirname, '.env');
const fs = require('fs');
if (fs.existsSync(envPath)) {
  console.log(`   ✅ .env file exists at: ${envPath}`);
} else {
  console.log(`   ❌ .env file NOT found at: ${envPath}`);
}

// Check DATABASE_URL
console.log('\n2. Checking DATABASE_URL...');
if (process.env.DATABASE_URL) {
  console.log(`   ✅ DATABASE_URL is defined`);
  console.log(`   Type: ${typeof process.env.DATABASE_URL}`);
  console.log(`   Length: ${process.env.DATABASE_URL.length} characters`);
  
  // Show first 50 characters (hide password)
  const url = process.env.DATABASE_URL;
  const atIndex = url.indexOf('@');
  if (atIndex > 0) {
    const before = url.substring(0, url.indexOf(':') + 1);
    const after = url.substring(atIndex);
    const hidden = before + '***PASSWORD***' + after;
    console.log(`   Value: ${hidden}`);
  } else {
    console.log(`   Value: ${url.substring(0, 50)}...`);
  }
} else {
  console.log(`   ❌ DATABASE_URL is NOT defined`);
  console.log('   Available environment variables:');
  Object.keys(process.env).forEach(key => {
    if (!key.includes('PATH') && !key.includes('SYSTEM')) {
      console.log(`      - ${key}`);
    }
  });
}

// Check for other important env variables
console.log('\n3. Checking other important variables...');
const envVars = ['NODE_ENV', 'PORT', 'SESSION_SECRET', 'JWT_SECRET'];
envVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: defined`);
  } else {
    console.log(`   ⚠️  ${varName}: NOT defined`);
  }
});

// Check DATABASE_URL format
console.log('\n4. Validating DATABASE_URL format...');
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  
  // Check for valid PostgreSQL URL format
  const checks = [
    { name: 'Starts with postgresql://', test: url.startsWith('postgresql://') || url.startsWith('postgres://') },
    { name: 'Contains @ symbol', test: url.includes('@') },
    { name: 'Contains colon (:) after protocol', test: url.includes('://') && url.indexOf(':') > url.indexOf('://') },
    { name: 'Is a string', test: typeof url === 'string' },
    { name: 'Is not empty', test: url.length > 0 },
  ];
  
  checks.forEach(check => {
    console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('✅ Test Complete');
console.log('='.repeat(60));

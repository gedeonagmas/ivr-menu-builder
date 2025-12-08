// Minimal test to see what's causing the freeze
// Run with: tsx test-startup.js
// Or: node --loader tsx/esm test-startup.js

console.log('1. Starting test...');

// Test 1: Basic Node.js
console.log('2. Node.js is working');

// Test 2: Import dotenv
try {
  const dotenv = await import('dotenv');
  dotenv.default.config();
  console.log('3. dotenv loaded');
} catch (e) {
  console.log('3. dotenv failed:', e.message);
}

// Test 3: Import Express
try {
  const express = await import('express');
  console.log('4. Express loaded');
} catch (e) {
  console.log('4. Express failed:', e.message);
}

// Test 4: Import logger
try {
  const { logger } = await import('./src/utils/logger.js');
  console.log('5. Logger loaded');
  logger.info('Logger test');
} catch (e) {
  console.log('5. Logger failed:', e.message);
}

// Test 5: Import Prisma (this might hang if DB connection is slow)
console.log('6. About to import Prisma...');
try {
  const { prisma } = await import('./src/database/prisma.js');
  console.log('7. Prisma loaded (not connected yet - will connect on first query)');
} catch (e) {
  console.log('7. Prisma failed:', e.message);
}

console.log('8. All imports successful - no freeze detected');
console.log('If you see this, the issue is likely in the server startup, not imports');


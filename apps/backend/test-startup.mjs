// Minimal test to see what's causing the freeze
// Run with: node test-startup.mjs

console.log('1. Starting test...');
console.log('2. Node.js is working');

// Test 1: Import dotenv
try {
  const dotenv = await import('dotenv');
  dotenv.default.config();
  console.log('3. dotenv loaded');
} catch (e) {
  console.log('3. dotenv failed:', e.message);
}

// Test 2: Import Express
try {
  await import('express');
  console.log('4. Express loaded');
} catch (e) {
  console.log('4. Express failed:', e.message);
}

// Test 3: Check if we can read files
try {
  const fs = await import('fs');
  const files = fs.default.readdirSync('./src');
  console.log('5. Can read src directory:', files.length, 'items');
} catch (e) {
  console.log('5. File read failed:', e.message);
}

console.log('6. Basic tests passed');
console.log('If you see this, try running: tsx src/index.ts');
console.log('If that freezes, the issue is in the TypeScript compilation or imports');





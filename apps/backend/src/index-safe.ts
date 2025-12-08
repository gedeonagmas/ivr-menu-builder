// Safe version - loads things one at a time to identify the blocker
console.log('1. Starting server...');

import express from 'express';
console.log('2. Express loaded');

import cors from 'cors';
console.log('3. CORS loaded');

import helmet from 'helmet';
console.log('4. Helmet loaded');

import dotenv from 'dotenv';
dotenv.config();
console.log('5. Dotenv loaded');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('6. Middleware configured');

// Health check - no dependencies
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log('7. Health check route added');

// Try loading logger
try {
  console.log('8. Attempting to load logger...');
  const { logger } = await import('./utils/logger.js');
  console.log('9. Logger loaded successfully');
  
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
  
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
} catch (error: any) {
  console.error('Logger failed:', error.message);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (no logger)`);
  });
}

console.log('10. Server setup complete');



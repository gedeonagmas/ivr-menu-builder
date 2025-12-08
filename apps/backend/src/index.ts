import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check - no dependencies, loads immediately
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Load routes immediately but make imports lazy to prevent blocking
// This ensures routes are registered before any requests come in
let routesLoaded = false;

async function loadRoutes() {
  if (routesLoaded) return;
  
  console.log('Loading routes...');
  
  try {
    const [
      { errorHandler },
      { logger },
      { authRoutes },
      { workflowRoutes },
      { callRoutes },
      { webhookRoutes },
      { fusionpbxWebhookRoutes },
      { analyticsRoutes },
      { phoneNumberRoutes },
      { recordingRoutes },
    ] = await Promise.all([
      import('./middleware/error-handler.js'),
      import('./utils/logger.js'),
      import('./routes/auth.routes.js'),
      import('./routes/workflow.routes.js'),
      import('./routes/call.routes.js'),
      import('./routes/webhook.routes.js'),
      import('./routes/fusionpbx-webhook.routes.js'),
      import('./routes/analytics.routes.js'),
      import('./routes/phone-number.routes.js'),
      import('./routes/recording.routes.js'),
    ]);

    // Add request logging middleware BEFORE routes
    app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });

    // Add routes
    app.use('/api/auth', authRoutes);
    app.use('/api/workflows', workflowRoutes);
    app.use('/api/calls', callRoutes);
    app.use('/api/webhooks', webhookRoutes);
    app.use('/api/fusionpbx-webhooks', fusionpbxWebhookRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/phone-numbers', phoneNumberRoutes);
    app.use('/api/recordings', recordingRoutes);

    // 404 handler - MUST be after routes
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handling MUST be last
    app.use(errorHandler);

    routesLoaded = true;
    console.log('Routes loaded successfully');
  } catch (error) {
    console.error('Error loading routes:', error);
    throw error;
  }
}

// Load routes and start server
loadRoutes()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 IVR Builder API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Routes loaded and server ready`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to load routes:', err);
    console.error('Server will not start without routes');
    process.exit(1);
  });

export default app;

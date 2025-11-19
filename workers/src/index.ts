import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initializeQueues, closeQueues } from './queue/bullmq.config.js';
import { buildWorker, testWorker, lintWorker, setupWorkerEvents, closeWorkers } from './queue/workers.js';
import { testRedisConnection, createRedisConnection } from './config/redis.js';
import routes from './api/routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Chef Workers',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Initialize the workers service
 */
async function initialize() {
  console.log('🚀 Starting Chef Workers Service...');
  console.log(`🌍 Environment: ${config.server.nodeEnv}`);

  try {
    // Test Redis connection
    const redis = createRedisConnection();
    const isConnected = await testRedisConnection(redis);

    if (!isConnected) {
      throw new Error('Failed to connect to Redis');
    }

    await redis.quit();

    // Initialize queues
    await initializeQueues();

    // Setup worker event listeners
    setupWorkerEvents();

    // Start HTTP server
    app.listen(config.server.port, () => {
      console.log(`✅ Workers service listening on port ${config.server.port}`);
      console.log(`📡 API available at http://localhost:${config.server.port}/api`);
      console.log(`👨‍💻 Workers are ready to process jobs`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize workers service:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('🛑 Shutting down gracefully...');

  try {
    await closeWorkers();
    await closeQueues();
    console.log('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the service
initialize();

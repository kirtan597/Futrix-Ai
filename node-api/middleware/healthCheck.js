/**
 * healthCheck.js
 * 
 * Production-grade health check endpoints for Kubernetes and container orchestration
 * 
 * Endpoints:
 * - GET /health - Basic health check (200 if alive)
 * - GET /health/ready - Readiness probe (200 if ready to accept traffic)
 * - GET /health/live - Liveness probe (200 if process is alive)
 */

const { checkDbConnection } = require('../db/supabaseClient');
const { getLogger } = require('../utils/logger');

const logger = getLogger('HealthCheck');

/**
 * Check database connectivity
 */
async function checkDatabase() {
  try {
    const { isConnected, error } = await checkDbConnection();
    if (isConnected) {
      return { status: 'healthy', message: 'PostgreSQL (Supabase) connected' };
    } else {
      return { status: 'unhealthy', message: `Database error: ${error || 'Not connected'}` };
    }
  } catch (err) {
    logger.error('Database health check failed:', { error: err.message });
    return { status: 'unhealthy', message: err.message };
  }
}

/**
 * Check external service (Python AI)
 */
async function checkExternalServices() {
  const pythonUrl = (process.env.PYTHON_URL || 'http://localhost:8000').replace(/\/$/, '');
  
  try {
    const response = await fetch(`${pythonUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      return { status: 'healthy', message: 'Python AI service healthy' };
    } else {
      return { status: 'unhealthy', message: `Python AI returned ${response.status}` };
    }
  } catch (err) {
    logger.warn('External service health check failed:', { error: err.message });
    return { status: 'degraded', message: `Python AI unreachable: ${err.message}` };
  }
}

/**
 * Liveness probe - is the process alive?
 * Used by Kubernetes to determine if container should be restarted
 */
const livenessProbe = (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

/**
 * Readiness probe - is the service ready to accept traffic?
 * Used by Kubernetes load balancers to route traffic
 */
const readinessProbe = async (req, res) => {
  const [dbHealth, serviceHealth] = await Promise.all([
    checkDatabase(),
    checkExternalServices(),
  ]);

  const isReady =
    dbHealth.status === 'healthy' &&
    (serviceHealth.status === 'healthy' || serviceHealth.status === 'degraded');

  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    status: isReady ? 'ready' : 'not-ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealth,
      externalServices: serviceHealth,
    },
  });
};

/**
 * Full health check endpoint
 * Returns comprehensive system health status
 */
const healthCheckEndpoint = async (req, res) => {
  const [dbHealth, serviceHealth] = await Promise.all([
    checkDatabase(),
    checkExternalServices(),
  ]);

  const isHealthy = dbHealth.status === 'healthy' && serviceHealth.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.API_VERSION || '2.1.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: dbHealth,
      externalServices: serviceHealth,
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
    },
  });
};

/**
 * Graceful shutdown hook
 * Kubernetes sends SIGTERM, giving the app time to finish requests
 */
function setupGracefulShutdown(server) {
  let isShuttingDown = false;

  const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}, starting graceful shutdown...`);
    isShuttingDown = true;

    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return () => isShuttingDown;
}

module.exports = {
  livenessProbe,
  readinessProbe,
  healthCheckEndpoint,
  setupGracefulShutdown,
  checkDatabase,
  checkExternalServices,
};
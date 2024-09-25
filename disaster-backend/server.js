// server.js
import http from 'http';
import app from './app.js';
import { initializeSocketIO } from './src/services/socketService.js';
import { initializeNeo4j } from './src/config/neo4jConfig.js';
import { monitorIncidents } from './src/workers/monitorIncidents.js';
import dotenv from 'dotenv';
import logger from './src/utils/logger.js';
import { checkEnv } from './checkEnv.js';
import { closeNeo4jConnection } from './src/config/neo4jConfig.js';
import { getRedisClient } from './src/services/statisticsService.js';

dotenv.config();

const PORT = process.env.PORT || 4000; // Fixed port

checkEnv();
initializeNeo4j();

const server = http.createServer(app);

initializeSocketIO(server);

// Start the incident monitoring interval
const incidentMonitorInterval = setInterval(monitorIncidents, 5 * 60 * 1000); // Run every 5 minutes

// Optionally run it immediately on startup
monitorIncidents();

server.listen(PORT, () => {
  console.log(`Disaster backend server is running on port ${PORT}`);
  logger.info(`Server is running on port ${PORT}`);
});

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  // Clear the incident monitoring interval
  clearInterval(incidentMonitorInterval);

  // Close server
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Additional cleanup if needed
  // e.g., Close database connections, clear timeouts, etc.

  // Exit the process after a delay to ensure all cleanup is complete
  setTimeout(() => {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }, 3000); // Adjust the delay as needed
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

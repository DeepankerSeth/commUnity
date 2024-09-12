// server.js
import http from 'http';
import app from './app.js';
import { initializeSocketIO } from './src/services/socketService.js';
import { initializeNeo4j } from './src/config/neo4jConfig.js';
import { monitorIncidents } from './src/workers/monitorIncidents.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from './src/utils/logger.js';
import { checkEnv } from './checkEnv.js';
import { closeNeo4jConnection } from './src/config/neo4jConfig.js';
import { getRedisClient } from './src/services/statisticsService.js';

console.log('Loading server.js');

console.log('UPDATED_OPEN_AI_API_KEY:', process.env.UPDATED_OPEN_AI_API_KEY);
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY);

const PORT = parseInt(process.env.PORT) || 3001;
const MAX_PORT_ATTEMPTS = 10;

async function startServer(attempt = 0) {
  if (attempt >= MAX_PORT_ATTEMPTS) {
    logger.error('Failed to find an available port after multiple attempts');
    process.exit(1);
  }

  const currentPort = PORT + attempt;

  if (currentPort >= 65536) {
    logger.error('Port number exceeded maximum allowed value');
    process.exit(1);
  }

  const server = http.createServer(app);
  initializeSocketIO(server);

  try {
    const neo4jConnected = await initializeNeo4j();
    if (!neo4jConnected) {
      logger.warn('Failed to connect to Neo4j. Continuing without Neo4j...');
    }
    await new Promise((resolve, reject) => {
      server.listen(currentPort, () => {
        logger.info(`Server started on port ${currentPort}`);
        resolve();
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn(`Port ${currentPort} is busy, trying the next one...`);
          reject(err);
        } else {
          logger.error('Error starting server:', err);
          reject(err);
        }
      });
    });
    
    // Start the incident monitoring worker
    monitorIncidents().catch(error => logger.error('Error in monitorIncidents:', error));
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      startServer(attempt + 1);
    } else {
      logger.error('Error starting server:', err);
      process.exit(1);
    }
  }
}

checkEnv();

startServer();

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
  });

  const redisClient = await getRedisClient();
  if (redisClient.isOpen) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }

  await closeNeo4jConnection();

  // Close other connections or perform cleanup here

  logger.info('Graceful shutdown completed');
  process.exit(0);
}
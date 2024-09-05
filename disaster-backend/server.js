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

console.log('Loading server.js');

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
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
      logger.error('Failed to connect to Neo4j. Exiting...');
      process.exit(1);
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

startServer();
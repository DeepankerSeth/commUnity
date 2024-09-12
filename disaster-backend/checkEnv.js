import dotenv from 'dotenv';
import logger from './src/utils/logger.js';

dotenv.config();

const requiredEnvVars = [
  'NEO4J_URI',
  'NEO4J_USERNAME',
  'NEO4J_PASSWORD',
  'UPDATED_OPEN_AI_API_KEY',
  // Add any other required environment variables
];

export function checkEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  logger.info('All required environment variables are set');
}

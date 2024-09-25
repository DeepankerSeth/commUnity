import dotenv from 'dotenv';
import app from './app.js';
import logger from './src/utils/logger.js';

dotenv.config();

const port = process.env.PORT || 5001; // Fixed port

const server = app.listen(port, () => {
  console.log(`Donation backend server is running on port ${port}`);
  logger.info(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
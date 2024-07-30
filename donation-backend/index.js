require('dotenv').config();
const app = require('./app');
const logger = require('./src/utils/logger');

const port = process.env.PORT || 3000;
let server;

const startServer = (port) => {
  server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`Donation backend server is running on port ${actualPort}`);
    logger.info(`Server is running on port ${actualPort}`);
  }).on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use, trying the next port`);
        startServer(port + 1);
        break;
      default:
        throw error;
    }
  });
};

startServer(port);
"use strict";

require('dotenv').config();

var app = require('./app');

var logger = require('./src/utils/logger');

var port = process.env.PORT || 3000;
var server;

var startServer = function startServer(port) {
  server = app.listen(port, function () {
    var actualPort = server.address().port;
    console.log("Donation backend server is running on port ".concat(actualPort));
    logger.info("Server is running on port ".concat(actualPort));
  }).on('error', function (error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error("".concat(bind, " requires elevated privileges"));
        process.exit(1);
        break;

      case 'EADDRINUSE':
        console.error("".concat(bind, " is already in use, trying the next port"));
        startServer(port + 1);
        break;

      default:
        throw error;
    }
  });
};

startServer(port);
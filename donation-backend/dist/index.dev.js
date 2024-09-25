"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

var _app = _interopRequireDefault(require("./app.js"));

var _logger = _interopRequireDefault(require("./src/utils/logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var port = process.env.PORT || 5001; // Fixed port

var server = _app["default"].listen(port, function () {
  console.log("Donation backend server is running on port ".concat(port));

  _logger["default"].info("Server is running on port ".concat(port));
}); // Graceful shutdown


process.on('SIGTERM', function () {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(function () {
    console.log('HTTP server closed');
  });
});
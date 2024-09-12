"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _charityRoutes = _interopRequireDefault(require("./src/routes/charityRoutes.js"));

var _xssClean = _interopRequireDefault(require("xss-clean"));

var _helmet = _interopRequireDefault(require("helmet"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cors = _interopRequireDefault(require("cors"));

var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));

var _requestId = _interopRequireDefault(require("./src/middleware/requestId.js"));

var _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));

var _yamljs = _interopRequireDefault(require("yamljs"));

var _logger = _interopRequireDefault(require("./src/utils/logger.js"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var app = (0, _express["default"])();
var port = process.env.PORT || 3000; // Default to 3000 if PORT is not set

app.use((0, _helmet["default"])());
app.use((0, _xssClean["default"])());
app.use(_bodyParser["default"].json());
app.use((0, _morgan["default"])('combined'));
app.use((0, _cors["default"])());
var limiter = (0, _expressRateLimit["default"])({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs

});
app.use(limiter);
app.use(_requestId["default"]);
app.use('/api/charities', _charityRoutes["default"]);

var swaggerDocument = _yamljs["default"].load('./src/swagger.yaml');

app.use('/api-docs', _swaggerUiExpress["default"].serve, _swaggerUiExpress["default"].setup(swaggerDocument)); // Global error handler

app.use(function (err, req, res, next) {
  _logger["default"].error('Unhandled error:', err);

  res.status(500).json({
    error: 'An unexpected error occurred'
  });
});
var server = app.listen(port, function () {
  var actualPort = server.address().port;
  console.log("Donation backend server is running on port ".concat(actualPort));
});
var _default = app;
exports["default"] = _default;
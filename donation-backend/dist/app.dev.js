"use strict";

var _authService = require("auth-service");

var express = require('express');

var bodyParser = require('body-parser');

var charityRoutes = require('./src/routes/charityRoutes');

var xss = require('xss-clean');

var helmet = require('helmet');

var morgan = require('morgan');

var cors = require('cors');

var rateLimit = require('express-rate-limit');

var requestId = require('./src/middleware/requestId');

var swaggerUi = require('swagger-ui-express');

var YAML = require('yamljs');

require('dotenv').config();

var app = express();
var port = process.env.PORT || 0;
app.use(helmet());
app.use(xss());
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors());
var limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs

});
app.use(limiter);
app.use(requestId);
app.use('/api/charities', charityRoutes);
var swaggerDocument = YAML.load('./src/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

var logger = require('./src/utils/logger'); // Use Passport middleware


app.use(_authService.passport.initialize()); // Use authentication routes

app.use('/auth', _authService.authRoutes); // Error handling middleware

app.use(function (err, req, res, next) {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!'
  });
});
var server = app.listen(port, function () {
  var actualPort = server.address().port;
  console.log("Server is running on port ".concat(actualPort));
});
module.exports = app;
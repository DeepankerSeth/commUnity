const express = require('express');
const bodyParser = require('body-parser');
const charityRoutes = require('./src/routes/charityRoutes');
const xss = require('xss-clean');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const requestId = require('./src/middleware/requestId');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();
import { passport, authRoutes } from 'auth-service';

const app = express();
const port = process.env.PORT || 0;

app.use(helmet());
app.use(xss());
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(requestId);

app.use('/api/charities', charityRoutes);

const swaggerDocument = YAML.load('./src/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const logger = require('./src/utils/logger');

// Use Passport middleware
app.use(passport.initialize());

// Use authentication routes
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`Server is running on port ${actualPort}`);
});

module.exports = app;
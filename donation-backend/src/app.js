const express = require('express');
const bodyParser = require('body-parser');
const charityRoutes = require('./routes/charityRoutes');
const xss = require('xss-clean');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const requestId = require('./middleware/requestId');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();

const app = express();

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

const logger = require('./utils/logger');

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

logger.info('Application initialized');

module.exports = app;
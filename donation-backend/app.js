import express from 'express';
import bodyParser from 'body-parser';
import charityRoutes from './src/routes/charityRoutes.js';
import xss from 'xss-clean';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import requestId from './src/middleware/requestId.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import logger from './src/utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(helmet());
app.use(xss());
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(requestId);

app.use('/api/charities', charityRoutes);

const swaggerDocument = YAML.load('./src/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

export default app;
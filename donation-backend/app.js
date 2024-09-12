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
const port = process.env.PORT || 3000;  // Default to 3000 if PORT is not set

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

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`Donation backend server is running on port ${actualPort}`);
});

export default app;
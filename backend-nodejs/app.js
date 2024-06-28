require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Import routes
const disasterPredictionRoutes = require('./src/routes/disasterPrediction');
const communityResourceRoutes = require('./src/routes/communityResource');
const charityRecommendationRoutes = require('./src/routes/charityRecommendation');

const apiGateway = require('./src/routes/apiGateway');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

//ingest API dat
const { ingestData } = require('./src/services/dataPipeline');

// Schedule data ingestion every hour
setInterval(ingestData, 3600000);

// Use routes
app.use('/api/disaster', disasterPredictionRoutes);
app.use('/api/community', communityResourceRoutes);
app.use('/api/charity', charityRecommendationRoutes);
app.use('/api', apiGateway);

// Security middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

//APIs
app.get('/', (req, res) => {
  res.send('Disaster Prediction and Response API');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




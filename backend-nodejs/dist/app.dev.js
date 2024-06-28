"use strict";

var express = require('express');

var app = express();
var port = process.env.PORT || 3000; // Import routes

var disasterPredictionRoutes = require('./src/routes/disasterPrediction');

var communityResourceRoutes = require('./src/routes/communityResource');

var charityRecommendationRoutes = require('./src/routes/charityRecommendation'); // Middleware


app.use(express.json()); // Use routes

app.use('/api/disaster', disasterPredictionRoutes);
app.use('/api/community', communityResourceRoutes);
app.use('/api/charity', charityRecommendationRoutes); // Start the server

app.listen(port, function () {
  console.log("Server running on port ".concat(port));
});
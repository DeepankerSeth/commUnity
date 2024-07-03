// Purpose: Ingest and process real-time data from PredictHQ (later multiple sources).


// src/services/dataPipeline.js
const { fetchDisasterData } = require('./predictHQservice');
const { cleanData } = require('../utils/dataCleaning');
const { logData } = require('../utils/logger'); // Added logging

// Function to ingest and process data
const ingestData = async () => {
  try {
    const disasterData = await fetchDisasterData();
    const radrData = await fetchRadrData();
    const cleanedDisasterData = cleanData(disasterData);
    const cleanedRadrData = cleanData(radrData);

    // Log the ingested data
    logData('Disaster Data', cleanedDisasterData);
    logData('RADR Data', cleanedRadrData);

    // Process and store cleaned data
    console.log('Data ingested and cleaned:', { cleanedDisasterData, cleanedRadrData });
  } catch (error) {
    console.error('Error ingesting data:', error);
  }
};

// Export the ingestData function
module.exports = { ingestData };


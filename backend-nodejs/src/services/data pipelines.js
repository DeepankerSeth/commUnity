// src/services/dataPipeline.js
const { fetchDisasterData } = require('./predictHQService');
//data cleaning
const { cleanData } = require('../utils/dataCleaning');

const ingestData = async () => {
    try {
      const disasterData = await fetchDisasterData();
      const cleanedDisasterData = cleanData(disasterData);
      // Process and store cleaned data
      console.log('Data ingested and cleaned:', { cleanedDisasterData });
    } catch (error) {
      console.error('Error ingesting data:', error);
    }
  };

module.exports = { ingestData };


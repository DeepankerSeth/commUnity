// Purpose: Ingest and process real-time data from PredictHQ (later multiple sources).

import { fetchDisasterData } from './predictHQservice';
import { cleanData } from '../utils/dataCleaning';
import { logData } from '../utils/logger'; // Added logging

// Function to ingest and process data
const ingestData = async () => {
  try {
    const disasterData = await fetchDisasterData();
    const cleanedDisasterData = cleanData(disasterData);

    // Log the ingested data
    logData('Disaster Data', cleanedDisasterData);

    // Process and store cleaned data
    console.log('Data ingested and cleaned:', { cleanedDisasterData });
  } catch (error) {
    console.error('Error ingesting data:', error);
  }
};

export { ingestData };
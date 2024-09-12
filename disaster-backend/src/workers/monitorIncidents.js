console.log('Loading monitorIncidents.js');
// workers/monitorIncidents.js
import dotenv from 'dotenv';
import { PineconeStore } from '@langchain/pinecone';
import pinecone from '../db/pinecone.js';
import { OpenAIEmbeddings } from '@langchain/openai';
import mongoose from 'mongoose';
import { getIncidentReport } from '../services/incidentService.js';
import { getIncidentUpdates, processIncident } from '../ai/llmProcessor.js';
import { OpenAI } from 'openai';
import { calculateDynamicImpactZone } from '../services/incidentAnalysisService.js';
import { generateNotification, sendNotification } from '../services/notificationService.js';
import { getClusterData } from '../services/clusteringService.js';
import { emitIncidentUpdate, emitNewIncident, emitVerificationUpdate, emitClusterUpdate } from '../services/socketService.js';
import { verifyIncident } from '../services/verificationService.js';
// import { checkGeofencesAndNotify } from '../services/geofencingService.js';
import {
  createIncidentNode,
  createKeywordRelationships,
  createLocationRelationship,
  getRelatedIncidents
} from '../services/graphDatabaseService.js';
import { generateStatistics } from '../services/statisticsService.js';
import logger from '../utils/logger.js';

dotenv.config();

import { initializeVectorStore } from '../utils/vectorStoreInitializer.js';

let vectorStore;

async function setupVectorStore() {
  const index = pinecone.Index(process.env.PINECONE_INDEX);
  vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: process.env.UPDATED_OPEN_AI_API_KEY }),
    { pineconeIndex: index }
  );
}

setupVectorStore();

let isMonitoring = false;

export async function monitorIncidents() {
  try {
    await setupVectorStore();

    if (isMonitoring) return;
    isMonitoring = true;

    logger.info('Starting monitorIncidents function');

    const recentIncidents = await getIncidentReport({
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
    });

    logger.info(`Found ${recentIncidents ? recentIncidents.length : 0 } recent incidents`);
    if (recentIncidents == undefined) {
      logger.info('No recent incidents found, skipping processing');
      return;
    }
    for (const incident of recentIncidents) {
      try {
        logger.info(`Processing incident ${incident._id}`);
        const analysis = await processIncident(incident);
        incident.analysis = analysis.analysis;
        incident.severity = analysis.severity;
        incident.impactRadius = analysis.impactRadius;

        // Update incident timeline
        incident.timeline.push({
          update: 'Incident reprocessed',
          severity: incident.severity,
          impactRadius: incident.impactRadius,
          timestamp: new Date()
        });

        await incident.save();
        logger.info(`Saved updated incident ${incident._id}`);

        // Update Neo4j if connected
        try {
          await createIncidentNode(incident);
          await createKeywordRelationships(incident._id.toString(), incident.metadata.keywords);
          await createLocationRelationship(incident._id.toString(), incident.metadata.placeOfImpact);
          logger.info(`Updated Neo4j for incident ${incident._id}`);
        } catch (neoError) {
          logger.warn(`Failed to update Neo4j for incident ${incident._id}:`, neoError);
        }

        // Get related incidents from Neo4j
        const relatedIncidents = await getRelatedIncidents(incident._id.toString());

        await incident.save();

        // Emit updated incident data to all connected clients
        emitIncidentUpdate(incident._id, incident);
        logger.info(`Emitted update for incident ${incident._id}`);
      } catch (error) {
        logger.error(`Error processing incident ${incident._id}:`, error);
      }
    }

    // Perform clustering
    try {
      logger.info('Performing clustering');
      const clusterData = await getClusterData();
      emitClusterUpdate(clusterData);
      logger.info('Clustering completed and emitted');
    } catch (error) {
      logger.error('Error performing clustering:', error);
    }

    // Generate and cache statistics
    try {
      logger.info('Generating statistics');
      await generateStatistics();
      logger.info('Statistics generated');
    } catch (error) {
      logger.error('Error generating statistics:', error);
    }
  } catch (error) {
    logger.error('Error in monitorIncidents:', error);
  } finally {
    logger.info('Scheduling next run of monitorIncidents');
    setTimeout(monitorIncidents, 60000); // Run every minute
  }
}

async function updateLLMModel() {
  try {
    const feedbackData = await getFeedbackForTraining();
    if (feedbackData.length > 0) {
      await fineTuneLLM(feedbackData);
      console.log('LLM model updated with new feedback data');
    }
  } catch (error) {
    console.error('Error updating LLM model:', error);
  }
}

// Call updateLLMModel every 24 hours
setInterval(updateLLMModel, 24 * 60 * 60 * 1000);

// Run the monitoring function every 5 minutes
setInterval(monitorIncidents, 5 * 60 * 1000);

logger.info('Incident monitoring worker loaded');

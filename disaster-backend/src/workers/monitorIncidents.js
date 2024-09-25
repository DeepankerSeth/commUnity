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
import { runQuery } from '../config/neo4jConfig.js';
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
    new OpenAIEmbeddings({ 
      modelName: "text-embedding-3-small", 
      openAIApiKey: process.env.UPDATED_OPEN_AI_API_KEY 
    }),
    { pineconeIndex: index }
  );
}

setupVectorStore();

let isMonitoring = false;

export async function monitorIncidents() {
  if (isMonitoring) {
    logger.info('monitorIncidents is already running. Skipping this execution.');
    return;
  }

  isMonitoring = true;
  try {
    logger.info('Starting monitorIncidents function');
    
    const recentIncidents = await runQuery(`
      MATCH (i:IncidentReport)
      WHERE i.createdAt >= datetime() - duration('PT30M')
      RETURN i
      ORDER BY i.createdAt DESC
    `);

    logger.info(`Found ${recentIncidents.length} recent incidents`);

    for (const record of recentIncidents) {
      const incident = record.get('i').properties;
      try {
        logger.info(`Processing incident ${incident.id}`);
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

        // Update incident in Neo4j
        await runQuery(`
          MATCH (i:IncidentReport {id: $id})
          SET i += $updates, i.updatedAt = datetime()
          RETURN i
        `, {
          id: incident.id,
          updates: {
            analysis: incident.analysis,
            severity: incident.severity,
            impactRadius: incident.impactRadius,
            timeline: incident.timeline
          }
        });

        logger.info(`Saved updated incident ${incident.id}`);

        // Update Neo4j graph structure
        try {
          await createIncidentNode(incident);
          await createKeywordRelationships(incident.id, incident.metadata.keywords);
          await createLocationRelationship(incident.id, incident.metadata.placeOfImpact);
          logger.info(`Updated Neo4j graph for incident ${incident.id}`);
        } catch (neoError) {
          logger.warn(`Failed to update Neo4j graph for incident ${incident.id}:`, neoError);
        }

        // Get related incidents from Neo4j
        const relatedIncidents = await runQuery(`
          MATCH (i:IncidentReport {id: $id})-[:HAS_KEYWORD]->(k:Keyword)<-[:HAS_KEYWORD]-(relatedIncident:IncidentReport)
          WHERE i <> relatedIncident
          RETURN DISTINCT relatedIncident, count(k) AS commonKeywords
          ORDER BY commonKeywords DESC
          LIMIT 5
        `, { id: incident.id });

        // Emit updated incident data to all connected clients
        emitIncidentUpdate(incident.id, {
          ...incident,
          relatedIncidents: relatedIncidents.map(record => ({
            incident: record.get('relatedIncident').properties,
            commonKeywords: record.get('commonKeywords').toNumber()
          }))
        });
        logger.info(`Emitted update for incident ${incident.id}`);
      } catch (error) {
        logger.error(`Error processing incident ${incident.id}:`, error);
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
    isMonitoring = false;
    logger.info('monitorIncidents execution completed');
  }
}

logger.info('Incident monitoring worker loaded');
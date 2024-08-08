// workers/monitorIncidents.js
import dotenv from 'dotenv';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import mongoose from 'mongoose';
import IncidentReport from '../models/incidentReport.js';
import { getIncidentUpdates, processIncident } from '../ai/llmProcessor.js';
import { OpenAI } from '@langchain/openai';
import { calculateDynamicImpactZone } from '../services/incidentAnalysisService.js';
import { generateNotification, sendNotification } from '../services/notificationService.js';
import User from '../models/userModel';
import { getClusterData } from '../services/clusteringService.js';
import { emitIncidentUpdate, emitNewIncident, emitVerificationUpdate } from '../services/socketService.js';
import { verifyIncident } from '../services/verificationService.js';
import { checkGeofencesAndNotify } from '../services/geofencingService.js';
import {
  createIncidentNode,
  createKeywordRelationships,
  createLocationRelationship,
  getRelatedIncidents
} from '../services/graphDatabaseService.js';

dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let vectorStore;

async function initializeVectorStore() {
  if (!vectorStore) {
    vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    );
  }
}

let isMonitoring = false;

async function monitorIncidents() {
  await initializeVectorStore();

  if (isMonitoring) return;
  isMonitoring = true;

  try {
    const recentIncidents = await IncidentReport.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
    });

    for (const incident of recentIncidents) {
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

      // Update Neo4j
      await createIncidentNode(incident);
      await createKeywordRelationships(incident._id.toString(), incident.metadata.keywords);
      await createLocationRelationship(incident._id.toString(), incident.metadata.placeOfImpact);

      // Get related incidents from Neo4j
      const relatedIncidents = await getRelatedIncidents(incident._id.toString());

      // Notify nearby users
      await notifyNearbyUsers(incident);

      // Check geofences and notify users
      await checkGeofencesAndNotify(incident);

      // Verify incident
      const verificationResult = await verifyIncident(incident._id);
      incident.verificationScore = verificationResult.verificationScore;
      incident.verificationStatus = verificationResult.verificationStatus;
      await incident.save();

      // Emit updated incident data to all connected clients
      emitIncidentUpdate(incident._id, incident);
      emitVerificationUpdate(incident._id, verificationResult.verificationScore, verificationResult.verificationStatus);
    }

    // Perform clustering
    const clusterData = await getClusterData();
    emitClusterUpdate(clusterData);

    // Generate and cache statistics
    try {
      await generateStatistics();
    } catch (error) {
      console.error('Error generating statistics:', error);
    }
  } catch (error) {
    console.error('Error in monitorIncidents:', error);
  } finally {
    isMonitoring = false;
    setTimeout(monitorIncidents, 60000); // Run every minute
  }
}

async function notifyNearbyUsers(incident) {
  const nearbyUsers = await User.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [incident.longitude, incident.latitude]
        },
        $maxDistance: incident.impactRadius * 1609.34 // Convert miles to meters
      }
    }
  });

  for (const user of nearbyUsers) {
    const notification = generateNotification(incident, user.location);
    await sendNotification(user, notification);
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

console.log('Incident monitoring worker started');

export { monitorIncidents };
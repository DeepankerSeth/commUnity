// workers/monitorIncidents.js
import dotenv from 'dotenv';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import mongoose from 'mongoose';
import IncidentReport from '../models/incidentReport.js';
import { getIncidentUpdates, processIncident } from '../ai/llmProcessor.js';
import { OpenAI } from '@langchain/openai';
import { calculateDynamicImpactZone } from '../services/incidentAnalysisService';
import { generateNotification, sendNotification } from '../services/notificationService';
import User from '../models/userModel';

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
      const similarIncidents = await IncidentReport.find({
        type: incident.type,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [incident.longitude, incident.latitude]
            },
            $maxDistance: 1000 // 1km radius
          }
        },
        _id: { $ne: incident._id }
      }).sort({ createdAt: -1 }).limit(1);

      if (similarIncidents.length > 0) {
        const analysis = await processIncident(incident);
        incident.analysis = analysis.analysis;
        incident.severity = analysis.severity;
        incident.impactRadius = analysis.impactRadius;
        await incident.save();

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

        // Emit updated incident data to all connected clients
        emitIncidentUpdate(incident._id, incident);
      }
    }
  } catch (error) {
    console.error('Error in incident monitoring:', error);
  } finally {
    isMonitoring = false;
  }
}

// Run the monitoring function every 5 minutes
setInterval(monitorIncidents, 5 * 60 * 1000);

console.log('Incident monitoring worker started');

export { monitorIncidents };
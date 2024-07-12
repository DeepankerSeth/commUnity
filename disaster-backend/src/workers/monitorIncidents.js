// workers/monitorIncidents.js
import dotenv from 'dotenv';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import mongoose from 'mongoose';
import IncidentReport from '../models/incidentReport.js';
import { getIncidentUpdates } from '../ai/llmProcessor.js';
import { OpenAI } from '@langchain/openai';

dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY }),
  { pineconeIndex }
);

async function monitorIncidents() {
  try {
    const recentIncidents = await IncidentReport.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
    });

    for (const incident of recentIncidents) {
      const similarIncidents = await vectorStore.similaritySearch(
        `${incident.type} ${incident.description}`,
        2,
        { reportId: { $ne: incident._id.toString() } }
      );

      if (similarIncidents.length >= 2) {
        // Send notification (implement your notification logic here)
        console.log(`Alert: Multiple reports for incident type ${incident.type} in the same area`);

        // Update incident status
        incident.status = 'active';
        await incident.save();

        // Get comprehensive update using LLM
        const analysis = await getIncidentUpdates(incident._id);
        console.log(`Incident Analysis: ${analysis}`);
      }
    }
  } catch (error) {
    console.error('Error in incident monitoring:', error);
  }
}

// Run the monitoring function every 5 minutes
setInterval(monitorIncidents, 5 * 60 * 1000);

console.log('Incident monitoring worker started');

export { monitorIncidents };
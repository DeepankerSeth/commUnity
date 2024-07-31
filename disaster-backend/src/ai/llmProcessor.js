import { OpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import mongoose from 'mongoose';
import IncidentReport from '../models/incidentReport.js';
import { uploadFile } from '../services/storageService.js';
import { emitIncidentUpdate } from '../services/socketService.js';
import { clusteringService } from '../services/clusteringService.js';
import { verifyIncident } from '../services/verificationService.js';

// Initialize OpenAI client
const openai = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY }),
  { pineconeIndex }
);

/**
 * Generates an embedding using OpenAI
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<Array>} - The generated embedding
 */
export async function generateEmbedding(text) {
  try {
    const response = await embeddings.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Processes an incident report using the LLM (e.g., GPT-4)
 * @param {Object} incident - The incident report to process
 * @returns {Promise<string>} - The analysis provided by the LLM
 */
export async function processIncident(incident) {
  const { description, type, latitude, longitude, mediaUrls } = incident;

  const prompt = `
Incident Description: ${description}
Incident Type: ${type}
Location: Latitude ${latitude}, Longitude ${longitude}
Media URLs: ${mediaUrls.join(', ')}

Analyze this incident report and provide the following:
1. A detailed picture of the incident including any connections or relevant context.
2. Assess the severity of the incident on a scale of 1-10, where 1 is minor and 10 is catastrophic.
3. Estimate the potential impact radius in miles.
4. List any immediate risks or dangers associated with this incident.
5. Suggest any immediate actions that should be taken by authorities or the public.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a disaster response AI assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
  });

  const analysis = response.choices[0].message.content;
  
  const severityMatch = analysis.match(/Severity: (\d+)/);
  const radiusMatch = analysis.match(/Impact Radius: (\d+(\.\d+)?)/);
  
  const severity = severityMatch ? parseInt(severityMatch[1]) : 5;
  const impactRadius = radiusMatch ? parseFloat(radiusMatch[1]) : 1;

  incident.timeline.push({
    update: analysis,
    severity,
    impactRadius
  });

  return {
    analysis,
    severity,
    impactRadius
  };
}

/**
 * Updates an incident report with new information
 * @param {string} incidentId - The ID of the incident to update
 * @param {Object} newReport - The new report containing additional information
 * @returns {Promise<Object>} - The updated incident
 */
export async function updateIncident(incidentId, newReport) {
  // Fetch existing incident
  const existingIncident = await IncidentReport.findById(incidentId);

  if (!existingIncident) {
    throw new Error('Incident not found');
  }

  const combinedDescription = `${existingIncident.description}\n\nUpdate: ${newReport.description}`;
  const updatedIncident = { ...existingIncident.toObject(), description: combinedDescription };
  
  const analysis = await processIncident(updatedIncident);

  // Update incident in MongoDB
  existingIncident.description = combinedDescription;
  existingIncident.analysis = analysis.analysis;
  existingIncident.severity = analysis.severity;
  existingIncident.impactRadius = analysis.impactRadius;
  await existingIncident.save();

  // Trigger re-evaluation of notifications
  monitorIncidents();

  // Emit incident update to connected clients
  emitIncidentUpdate(incidentId, existingIncident);

  return existingIncident;
}

/**
 * Creates a new incident report and stores it in MongoDB and Pinecone
 * @param {Object} incidentData - The incident data to store
 * @returns {Promise<Object>} - The created incident report
 */
export async function createIncidentReport(incidentData) {
  const { userId, type, description, latitude, longitude, mediaUrls } = incidentData;

  // Analyze media content
  const mediaAnalyses = await Promise.all(mediaUrls.map(async (url) => {
    const fileExtension = path.extname(url).toLowerCase();
    let mediaType;
    if (['.jpg', '.jpeg', '.png', '.gif', '.heic', '.heif'].includes(fileExtension)) {
      mediaType = 'image';
    } else if (['.mp4', '.avi', '.mov', '.mpg', '.mpeg', '.mpg4', '.m4v', '.mp4a', '.mp4v'].includes(fileExtension)) {
      mediaType = 'video';
    } else if (['.mp3', '.wav', '.ogg', '.mpga', '.m4a', '.mp4a'].includes(fileExtension)) {
      mediaType = 'audio';
    } else {
      mediaType = 'file';
    }
    return await analyzeMedia(url, mediaType);
  }));

  const combinedDescription = `${description}\n\nMedia Analyses:\n${mediaAnalyses.join('\n')}`;

  // Create incident report in MongoDB
  const incidentReport = new IncidentReport({
    userId,
    type,
    description: combinedDescription,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    mediaUrls,
    timeline: [{ update: 'Incident created', timestamp: new Date() }]
  });
  await incidentReport.save();

  // Create vector embedding
  const embedding = await generateEmbedding(`${type} ${combinedDescription}`);

  // Store vector in Pinecone
  const vectorId = incidentReport._id.toString();
  await vectorStore.addDocuments([
    {
      id: vectorId,
      values: embedding,
      metadata: { 
        type, 
        description: combinedDescription, 
        latitude, 
        longitude,
        reportId: incidentReport._id
      }
    }
  ]);

  // Update incident report with vector ID
  incidentReport.vectorId = vectorId;
  await incidentReport.save();

  return incidentReport;
}

/**
 * Retrieves and processes similar incidents
 * @param {string} incidentId - The ID of the incident to update
 * @returns {Promise<string>} - The analysis provided by the LLM
 */
export async function getIncidentUpdates(incidentId) {
  const incident = await IncidentReport.findById(incidentId);

  if (!incident) {
    throw new Error('Incident not found');
  }

  // Query similar incidents
  const similarIncidents = await vectorStore.similaritySearch(
    `${incident.type} ${incident.description}`,
    5,
    { reportId: { $ne: incidentId } }
  );

  // Process with LLM
  const prompt = `
    Analyze the following incident and similar incidents to provide a comprehensive update:

    Main Incident:
    Type: ${incident.type}
    Description: ${incident.description}

    Similar Incidents:
    ${similarIncidents.map(inc => `- ${inc.pageContent}`).join('\n')}

    Provide a detailed update on the situation, including any patterns, potential risks, and recommended actions.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: "You are a disaster response AI assistant." }, { role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

/**
 * Fetches the incident timeline
 * @param {string} incidentId - The ID of the incident
 * @returns {Promise<Object[]>} - The incident timeline
 */
export async function getIncidentTimeline(incidentId) {
  const incident = await IncidentReport.findById(incidentId);
  if (!incident) {
    throw new Error('Incident not found');
  }
  return incident.timeline;
}

async function analyzeMedia(url, mediaType) {
  // Implement media analysis logic here
  // This could involve calling a computer vision API for images/videos
  // or a speech-to-text API for audio files
  // For now, we'll return a placeholder analysis
  return `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} analysis: Content appears to be related to the incident.`;
}
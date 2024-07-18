import { OpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import mongoose from 'mongoose';
import IncidentReport from '../models/incidentReport.js';
import { uploadFile } from '../services/storageService.js';

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
  const { description, photo, video, file } = incident;

  // Construct prompt for LLM
  const prompt = `
Incident Description: ${description}
${photo ? `Photo: [attached]` : ''}
${file ? `File: [attached]` : ''}
Analyze this incident report and provide a detailed picture of the incident including any connections or relevant context.
  `;

  // Get analysis from OpenAI
  const response = await openai.createCompletion({
    model: 'gpt-4',
    prompt,
    max_tokens: 500,
  });

  return response.data.choices[0].text;
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

  // Combine existing description with new report
  const combinedDescription = `${existingIncident.description}\n\n${newReport.description}`;
  const prompt = `
Incident Description: ${combinedDescription}
Analyze the combined reports and provide a comprehensive update on the incident.
  `;

  // Get updated analysis from OpenAI
  const response = await openai.createCompletion({
    model: 'gpt-4',
    prompt,
    max_tokens: 500,
  });

  const updatedAnalysis = response.data.choices[0].text;

  // Update incident in MongoDB
  existingIncident.description = combinedDescription;
  existingIncident.analysis = updatedAnalysis;
  await existingIncident.save();

  return existingIncident;
}

/**
 * Creates a new incident report and stores it in MongoDB and Pinecone
 * @param {Object} incidentData - The incident data to store
 * @returns {Promise<Object>} - The created incident report
 */
export async function createIncidentReport(incidentData) {
  const { userId, type, description, latitude, longitude, mediaUrls } = incidentData;

  // Create incident report in MongoDB
  const incidentReport = new IncidentReport({
    userId,
    type,
    description,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    mediaUrls
  });
  await incidentReport.save();

  // Create vector embedding
  const embedding = await generateEmbedding(`${type} ${description}`);

  // Store vector in Pinecone
  const vectorId = incidentReport._id.toString();
  await vectorStore.addDocuments([
    {
      id: vectorId,
      values: embedding,
      metadata: { 
        type, 
        description, 
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
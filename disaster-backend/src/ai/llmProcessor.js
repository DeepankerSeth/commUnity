console.log('Loading llmProcessor.js');
import OpenAI from 'openai';
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { getIncidentReportNeo4j } from '../services/graphDatabaseService.js';
import { uploadFile } from '../services/storageService.js';
import { emitIncidentUpdate } from '../services/socketService.js';
import { performClustering, getClusterData } from '../services/clusteringService.js';
import { verifyIncident } from '../services/verificationService.js';
import { performHybridSearch } from '../services/searchService.js';
import path from 'path';
import { initializeVectorStore } from '../utils/vectorStoreInitializer.js';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const apiKey = process.env.OPENAI_API_KEY_NEW;
console.log('Using OpenAI API Key:', apiKey.substring(0, 10) + '...');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_NEW,
});

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY_NEW,
});

console.log('Embeddings object:', embeddings);
console.log('Embeddings methods:', Object.keys(embeddings));

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

console.log('OPENAI_API_KEY_NEW in llmProcessor working:', process.env.OPENAI_API_KEY_NEW);
console.log('PINECONE_API_KEY in llmProcessor working:', process.env.PINECONE_API_KEY);

// Initialize PineconeStore with the correct embeddings object
const vectorStore = await initializeVectorStore();

/**
 * Generates an embedding using OpenAI
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<Array>} - The generated embedding
 */
export async function generateEmbedding(text) {
  try {
    if (!text) {
      throw new Error('Text for embedding is empty or undefined');
    }
    const embeddingResult = await embeddings.embedDocuments([text]);
    if (!embeddingResult || embeddingResult.length === 0) {
      throw new Error('Embedding generation failed');
    }
    return embeddingResult[0]; // Return the first (and only) embedding
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Processes an incident report using the LLM (e.g., GPT-4)
 * @param {Object} incident - The incident report to process
 * @returns {Promise<Object>} - The analysis provided by the LLM
 */
export async function processIncident(incident) {
  const chat = new ChatOpenAI({ temperature: 0.7 });
  const prompt = ChatPromptTemplate.fromTemplate(`
    Analyze the following incident:
    Type: {type}
    Description: {description}
    Location: Latitude {latitude}, Longitude {longitude}
    Media URLs: {mediaUrls}

    Provide the following information:
    1. If the incident type is specified or not, determine the most appropriate type from this list if applicable or assign an appropriate type to the best of your ability: Fire, Flood, Earthquake, Hurricane, Tornado, Landslide, Tsunami, Volcanic Eruption, Wildfire, Blizzard, Drought, Heatwave, Chemical Spill, Nuclear Incident, Terrorist Attack, Civil Unrest, Pandemic, Infrastructure Failure, Transportation Accident, Other.
    2. A concise and descriptive title for the incident (max 10 words).
    3. A detailed analysis of the incident (max 200 words)
    4. Assess the severity of the incident on a scale of 1-10, where 1 is minor and 10 is catastrophic
    5. Estimate the potential impact radius in miles
    6. List any immediate risks or dangers associated with this incident (comma-separated)
    7. Suggest immediate actions that should be taken by authorities or the public (comma-separated)

    Format your response as a JSON object with the following structure:
    {
      "type": "string",
      "title": "string",
      "analysis": "string",
      "severity": number,
      "impactRadius": number,
      "immediateRisks": ["string"],
      "recommendedActions": ["string"]
    }
  `);

  const chain = prompt.pipe(chat);
  const response = await chain.invoke({
    type: incident.type,
    description: incident.description,
    latitude: incident.latitude,
    longitude: incident.longitude,
    mediaUrls: incident.mediaUrls ? incident.mediaUrls.join(', ') : 'None'
  });

  return JSON.parse(response.text);
}

/**
 * Updates an incident report with new information
 * @param {string} incidentId - The ID of the incident to update
 * @param {Object} newReport - The new report containing additional information
 * @returns {Promise<Object>} - The updated incident
 */
export async function updateIncident(incidentId, newReport) {
  // Fetch existing incident
  const existingIncident = await getIncidentReportNeo4j(incidentId);

  if (!existingIncident) {
    throw new Error('Incident not found');
  }

  const combinedDescription = `${existingIncident.description}\n\nUpdate: ${newReport.description}`;
  const updatedIncident = { ...existingIncident, description: combinedDescription };
  
  const analysis = await processIncident(updatedIncident);

  // Update incident in Neo4j
  await updateIncidentReport(incidentId, {
    description: combinedDescription,
    analysis: analysis.analysis,
    severity: analysis.severity,
    impactRadius: analysis.impactRadius,
    metadata: analysis.metadata
  });

  // Get related incidents from Neo4j
  const relatedIncidents = await getRelatedIncidents(incidentId);

  // Emit incident update to connected clients
  emitIncidentUpdate(incidentId, {
    description: combinedDescription,
    analysis: analysis.analysis,
    severity: analysis.severity,
    impactRadius: analysis.impactRadius,
    metadata: analysis.metadata
  });

  return updatedIncident;
}

// /**
//  * Creates a new incident report and stores it in Neo4j and Pinecone
//  * @param {Object} incidentData - The incident data to store
//  * @returns {Promise<Object>} - The created incident report
//  */
// export async function createNewIncidentReport(incidentData) {
//   console.log('Received incident data:', incidentData);
//   const { type, description, location, mediaUrls } = incidentData;

//   // Validate required fields
//   if (!type || !description) {
//     throw new Error('Type and description are required fields');
//   }

//   // Process the incident with LLM
//   const analysis = await processIncident({ type, description, location, mediaUrls });

//   const incidentReport = {
//     type,
//     description,
//     location,
//     mediaUrls,
//     analysis: analysis.analysis,
//     severity: analysis.severity,
//     impactRadius: analysis.impactRadius,
//     metadata: {
//       ...analysis.metadata,
//       keywords: analysis.metadata?.keywords || [],
//       incidentName: analysis.metadata?.incidentName || 'Unnamed Incident',
//       placeOfImpact: analysis.placeOfImpact || 'Unknown Location'
//     },
//     timeline: [{ update: 'Incident created', timestamp: new Date() }]
//   };

//   // Create vector embedding and store in Pinecone
//   const embeddingText = `${type} ${description}`;
//   const embedding = await generateEmbedding(embeddingText);
//   if (embedding && embedding.length > 0) {
//     try {
//       await initializeVectorStore();
//       await vectorStore.addDocuments([
//         {
//           pageContent: embeddingText,
//           metadata: { 
//             type,
//             description, 
//             latitude: location?.coordinates[1], 
//             longitude: location?.coordinates[0]
//           }
//         }
//       ]);
//     } catch (error) {
//       console.error('Error adding document to vector store:', error);
//     }
//   } else {
//     console.error('Failed to generate embedding');
//   }

//   // Store in Neo4j
//   const createdIncident = await createNewIncidentReport(incidentReport);

//   return createdIncident;
// }

/**
 * Retrieves and processes similar incidents
 * @param {string} incidentId - The ID of the incident to update
 * @returns {Promise<string>} - The analysis provided by the LLM
 */
export async function getIncidentUpdates(incidentId) {
  const incident = await getIncidentReportNeo4j(incidentId);

  if (!incident) {
    throw new Error('Incident not found');
  }

  // Perform hybrid search
  const similarIncidents = await performHybridSearch(
    `${incident.type} ${incident.description}`,
    5,
    { reportId: { $ne: incidentId } }
  );

  // Get related incidents from Neo4j
  const relatedIncidents = await getRelatedIncidents(incidentId);

  // Process with LLM
  const prompt = `
    Analyze the following incident, similar incidents, and related incidents to provide a comprehensive update:

    Main Incident:
    Type: ${incident.type}
    Description: ${incident.description}

    Similar Incidents:
    ${similarIncidents.map(inc => `- ${inc.pageContent}`).join('\n')}

    Related Incidents:
    ${relatedIncidents.map(inc => `- ${inc.incident.type}: ${inc.incident.description}`).join('\n')}

    Provide a detailed update on the situation, including any patterns, potential risks, and recommended actions.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: "You are a disaster response AI assistant." }, { role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
    top_p: 1
  });
  const content = response.choices[0].message.content;
  console.log(content);
  return content;
}

/**
 * Fetches the incident timeline
 * @param {string} incidentId - The ID of the incident
 * @returns {Promise<Object[]>} - The incident timeline
 */
export async function getIncidentTimeline(incidentId) {
  const incident = await getIncidentReportNeo4j(incidentId);
  if (!incident) {
    throw new Error('Incident not found');
  }
  return incident.timeline;
}

export async function updateMetadataWithFeedback(incidentId, userFeedback) {
  const incident = await getIncidentReportNeo4j(incidentId);

  if (!incident) {
    throw new Error('Incident not found');
  }

  const prompt = `
    Original Incident:
    Type: ${incident.type}
    Description: ${incident.description}
    Current Metadata: ${JSON.stringify(incident.metadata)}

    User Feedback: ${userFeedback}

    Based on the user feedback, please update the incident metadata. Provide the updated metadata in the following format:
    Incident Name: [Updated name]
    Place of Impact: [Updated place]
    Keywords: [Updated comma-separated list of keywords]
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: "You are a disaster response AI assistant." }, { role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 200,
    top_p: 1
  });

  const updatedMetadata = parseMetadataFromResponse(response.choices[0].message.content);

  incident.metadata = { ...incident.metadata, ...updatedMetadata };
  await updateIncidentReport(incidentId, { metadata: incident.metadata });

  // Log the feedback and updated metadata for future model fine-tuning
  console.log('User feedback:', userFeedback);
  console.log('Updated metadata:', updatedMetadata);
  // TODO: Implement a mechanism to collect this data for periodic model fine-tuning

  return incident;
}

function parseMetadataFromResponse(response) {
  const nameMatch = response.match(/Incident Name: (.+)/);
  const placeMatch = response.match(/Place of Impact: (.+)/);
  const keywordsMatch = response.match(/Keywords: (.+)/);

  return {
    incidentName: nameMatch ? nameMatch[1].trim() : '',
    placeOfImpact: placeMatch ? placeMatch[1].trim() : '',
    keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : []
  };
}

async function analyzeMedia(url, mediaType) {
  // Implement media analysis logic here
  // This could involve calling a computer vision API for images/videos
  // or a speech-to-text API for audio files
  // For now, we'll return a placeholder analysis
  return `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} analysis: Content appears to be related to the incident.`;
}
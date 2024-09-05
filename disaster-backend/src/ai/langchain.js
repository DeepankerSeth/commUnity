console.log('Loading llmProcessor.js');
import { OpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { getIncidentReportNeo4j, updateIncidentReport, getRelatedIncidents } from '../services/graphDatabaseService.js';
import { uploadFile } from '../services/storageService.js';
import { emitIncidentUpdate } from '../services/socketService.js';
import { performClustering, getClusterData } from '../services/clusteringService.js';
import { verifyIncident } from '../services/verificationService.js';
import { performHybridSearch } from '../services/searchService.js';
import { initializeVectorStore } from '../utils/vectorStoreInitializer.js';
import { updateVectorStore } from '../services/searchService.js';

const apiKey = process.env.OPENAI_API_KEY;
console.log('Using OpenAI API Key:', apiKey.substring(0, 10) + '...');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const vectorStore = await initializeVectorStore();

export async function generateEmbedding(text) {
  try {
    if (!text) {
      throw new Error('Text for embedding is empty or undefined');
    }
    const embeddingResult = await embeddings.embedDocuments([text]);
    if (!embeddingResult || embeddingResult.length === 0) {
      throw new Error('Embedding generation failed');
    }
    return embeddingResult[0];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

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
    8. Identify keywords related to this incident (comma-separated)
    9. Suggest a name for the incident (e.g., "2023 California Wildfire")
    10. Identify the specific place of impact (e.g., "Downtown Los Angeles")
    11. Identify the broader neighborhood or region affected (e.g., "Southern California")

    Format your response as a JSON object with the following structure:
    {
      "type": "string",
      "title": "string",
      "analysis": "string",
      "severity": number,
      "impactRadius": number,
      "immediateRisks": ["string"],
      "recommendedActions": ["string"],
      "keywords": ["string"],
      "incidentName": "string",
      "placeOfImpact": "string",
      "neighborhood": "string"
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

  return JSON.parse(response.content);
}

export async function updateIncidentVectorStore(incident) {
  await updateVectorStore(incident);
}

export async function updateIncident(incidentId, newReport) {
  const existingIncident = await getIncidentReportNeo4j(incidentId);

  if (!existingIncident) {
    throw new Error('Incident not found');
  }

  const combinedDescription = `${existingIncident.description}\n\nUpdate: ${newReport.description}`;
  const updatedIncident = { ...existingIncident, description: combinedDescription };
  
  const analysis = await processIncident(updatedIncident);

  const updatedData = {
    description: combinedDescription,
    analysis: analysis.analysis,
    severity: analysis.severity,
    impactRadius: analysis.impactRadius,
    metadata: {
      immediateRisks: analysis.immediateRisks,
      recommendedActions: analysis.recommendedActions,
      keywords: analysis.keywords,
      incidentName: analysis.incidentName,
      placeOfImpact: analysis.placeOfImpact,
      neighborhood: analysis.neighborhood
    }
  };

  await updateIncidentReport(incidentId, updatedData);
  await updateIncidentVectorStore({ ...updatedIncident, ...updatedData });

  const relatedIncidents = await getRelatedIncidents(incidentId);

  emitIncidentUpdate(incidentId, updatedData);

  return { ...updatedIncident, ...updatedData };
}

export async function getIncidentUpdates(incidentId) {
  const incident = await getIncidentReportNeo4j(incidentId);

  if (!incident) {
    throw new Error('Incident not found');
  }

  const similarIncidents = await performHybridSearch(
    `${incident.type} ${incident.description}`,
    5,
    { reportId: { $ne: incidentId } }
  );

  const relatedIncidents = await getRelatedIncidents(incidentId);

  const prompt = `
    Analyze the following incident, similar incidents, and related incidents to provide a comprehensive update:

    Main Incident:
    Type: ${incident.type}
    Description: ${incident.description}
    Incident Name: ${incident.metadata.incidentName}
    Place of Impact: ${incident.metadata.placeOfImpact}
    Neighborhood: ${incident.metadata.neighborhood}

    Similar Incidents:
    ${similarIncidents.map(inc => `- ${inc.pageContent}`).join('\n')}

    Related Incidents:
    ${relatedIncidents.map(inc => `- ${inc.incident.type}: ${inc.incident.description}`).join('\n')}

    Provide a detailed update on the situation, including any patterns, potential risks, and recommended actions.
    Also, suggest any changes to the severity, impact radius, or metadata based on this new information.
  `;

  const chat = new ChatOpenAI({ temperature: 0.7 });
  const response = await chat.invoke(prompt);

  return response.content;
}
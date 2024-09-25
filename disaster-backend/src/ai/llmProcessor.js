console.log('Loading llmProcessor.js');
import { OpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { getIncidentReportNeo4j, updateIncidentReport, getRelatedIncidents } from '../services/graphDatabaseService.js';
import { updateVectorStore } from '../services/searchService.js';
import { emitIncidentUpdate } from '../services/socketService.js';
import { initializeVectorStore } from '../utils/vectorStoreInitializer.js';
import { performHybridSearch } from '../services/searchService.js';

const openai = new OpenAI({
  apiKey: process.env.UPDATED_OPEN_AI_API_KEY,
});

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.UPDATED_OPEN_AI_API_KEY,
});

console.log('Embeddings object:', embeddings);
console.log('Embeddings methods:', Object.keys(embeddings));

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

console.log('UPDATED_OPEN_AI_API_KEY in llmProcessor working:', process.env.UPDATED_OPEN_AI_API_KEY);
console.log('PINECONE_API_KEY in llmProcessor working:', process.env.PINECONE_API_KEY);

// Initialize PineconeStore with the correct embeddings object
let vectorStore;

(async () => {
  vectorStore = await initializeVectorStore();
})();

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

async function processIncident(incident) {
  try {
    const chat = new ChatOpenAI({ 
      openAIApiKey: process.env.UPDATED_OPEN_AI_API_KEY,
      temperature: 0.7 });
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
      10. Identify the specific place of impact (e.g., "123 Main St, Downtown Los Angeles")
      11. Identify the broader neighborhood or region affected (e.g., "Downtown Los Angeles")

      Format your response as a JSON object with the following structure:
      {{
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
      }}
    `);

    const chain = prompt.pipe(chat);
    const response = await chain.invoke({
      type: incident.type || "Unknown",
      description: incident.description || "No description provided",
      latitude: incident.latitude || incident.location?.coordinates?.[1] || "Unknown",
      longitude: incident.longitude || incident.location?.coordinates?.[0] || "Unknown",
      mediaUrls: incident.mediaUrls || 'None'
    });

    console.log("LLM Response:", response);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.content);
    } catch (parseError) {
      console.error("Error parsing LLM response:", parseError);
      parsedResponse = {};
    }
    
    // Ensure all required fields are present
    const defaultResponse = {
      type: "Unknown",
      title: "Untitled Incident",
      analysis: "No analysis provided",
      severity: 1,
      impactRadius: 0,
      immediateRisks: [],
      recommendedActions: [],
      keywords: [],
      incidentName: "Unnamed Incident",
      placeOfImpact: "Unknown",
      neighborhood: "Unknown"
    };

    // Validate the result
    if (!parsedResponse.type || !parsedResponse.title || !parsedResponse.analysis || 
        parsedResponse.severity === undefined || parsedResponse.impactRadius === undefined || 
        !parsedResponse.immediateRisks || !parsedResponse.recommendedActions) {
      throw new Error("Incomplete response from AI");
    }

    return { ...defaultResponse, ...parsedResponse };
  } catch (error) {
    console.error("Error processing incident with LangChain:", error);
    throw error;
  }
}

async function updateIncident(incidentId, newReport) {
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
  await updateVectorStore({ ...updatedIncident, ...updatedData });

  const relatedIncidents = await getRelatedIncidents(incidentId);

  emitIncidentUpdate(incidentId, updatedData);

  return { ...updatedIncident, ...updatedData };
}

async function getIncidentUpdates(incidentId) {
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

async function getIncidentTimeline(incidentId) {
  const incident = await getIncidentReportNeo4j(incidentId);
  if (!incident) {
    throw new Error('Incident not found');
  }
  return incident.timeline;
}

async function updateMetadataWithFeedback(incidentId, userFeedback) {
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
    model: "gpt-4o",
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

export {
  processIncident,
  updateIncident,
  getIncidentUpdates,
  getIncidentTimeline,
  updateMetadataWithFeedback,
  analyzeMedia
};
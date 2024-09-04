console.log('Loading langchain.js');
import { OpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { initializeVectorStore } from '../utils/vectorStoreInitializer.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_NEW });

let vectorStore;

async function setupVectorStore() {
  vectorStore = await initializeVectorStore();
}

setupVectorStore();

const processIncident = async (incident) => {
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

Format your response as a JSON object with the following structure:
{
  "analysis": "string",
  "severity": number,
  "impactRadius": number,
  "immediateRisks": ["string"],
  "recommendedActions": ["string"]
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a disaster response AI assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const result = JSON.parse(response.choices[0].message.content);
  console.log(result);
  return {
    analysis: result.analysis,
    severity: result.severity,
    impactRadius: result.impactRadius,
    immediateRisks: result.immediateRisks,
    recommendedActions: result.recommendedActions
  };
};

async function addIncidentToVectorStore(incident) {
  const { _id, type, description, latitude, longitude } = incident;
  const document = {
    pageContent: `${type}: ${description}`,
    metadata: {
      id: _id.toString(),
      type,
      latitude,
      longitude
    }
  };
  await vectorStore.addDocuments([document]);
}

async function searchSimilarIncidents(query, k = 5) {
  return await vectorStore.similaritySearch(query, k);
}

export { processIncident, addIncidentToVectorStore, searchSimilarIncidents };
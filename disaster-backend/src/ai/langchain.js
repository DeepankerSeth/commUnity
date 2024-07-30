import { OpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { queryVectors } from '../db/pinecone';
import { createIncidentReport, getIncidentUpdates } from './llmProcessor';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY }),
  { pineconeIndex }
);

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
  
  // Extract severity and impact radius using regex
  const severityMatch = analysis.match(/Severity: (\d+)/);
  const radiusMatch = analysis.match(/Impact Radius: (\d+(\.\d+)?)/);
  
  return {
    analysis,
    severity: severityMatch ? parseInt(severityMatch[1]) : 5, // Default to 5 if not found
    impactRadius: radiusMatch ? parseFloat(radiusMatch[1]) : 2 // Default to 2 mile if not found
  };
};

export { processIncident };
const { OpenAI } = require('langchain');
const { PineconeStore } = require('@langchain/pinecone');
const { Pinecone } = require('@pinecone-database/pinecone');
const { queryVectors } = require('../db/pinecone');
const { createIncidentReport, getIncidentUpdates } = require('./llmProcessor');

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

const processIncident = async (incidentData) => {
  try {
    // Create incident report
    const incidentReport = await createIncidentReport(incidentData);

    // Retrieve similar incidents from Pinecone
    const similarIncidents = await vectorStore.similaritySearch(
      `${incidentData.type} ${incidentData.description}`,
      5,
      { reportId: { $ne: incidentReport._id.toString() } }
    );

    // Analyze similar incidents with OpenAI
    const prompt = `Analyze these incidents: ${JSON.stringify(similarIncidents)} and provide a comprehensive understanding.`;
    const response = await openai.completions.create({
      model: "gpt-4",
      prompt,
    });

    return response.choices[0].text;
  } catch (error) {
    console.error('Error processing incident:', error);
    throw new Error('Failed to process incident');
  }
};

module.exports = { processIncident };
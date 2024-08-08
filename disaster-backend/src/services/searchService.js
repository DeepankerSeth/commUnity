import { PineconeStore } from '@langchain/pinecone';
import { OpenAI } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import IncidentReport from '../models/incidentReport.js';
import { FuzzySearch } from 'fuzzy-search';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY }),
  { pineconeIndex }
);

export async function performHybridSearch(query, k, filters = {}) {
  // Vector similarity search
  const vectorResults = await vectorStore.similaritySearch(query, k);

  // Semantic search
  const semanticResults = await performSemanticSearch(query, k);

  // Keyword-based search with fuzzy matching
  const fuzzyResults = await performFuzzySearch(query, k, filters);

  // Combine and deduplicate results
  const combinedResults = [...vectorResults, ...semanticResults, ...fuzzyResults];
  const uniqueResults = Array.from(new Set(combinedResults.map(r => r._id.toString())))
    .map(_id => combinedResults.find(r => r._id.toString() === _id));

  // Sort by relevance (you may need to implement a custom relevance scoring function)
  uniqueResults.sort((a, b) => b.score - a.score);

  return uniqueResults.slice(0, k);
}

async function performSemanticSearch(query, k) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });

  const results = await vectorStore.similaritySearchVectorWithScore(embedding.data[0].embedding, k);
  return results.map(([doc, score]) => ({ ...doc, score }));
}

async function performFuzzySearch(query, k, filters) {
  const incidents = await IncidentReport.find(filters);
  const fuzzySearcher = new FuzzySearch(incidents, ['type', 'description'], {
    caseSensitive: false,
    sort: true,
  });

  return fuzzySearcher.search(query).slice(0, k);
}

export async function getFacets() {
  const incidentTypes = await IncidentReport.distinct('type');
  const severities = await IncidentReport.distinct('severity');
  const statuses = await IncidentReport.distinct('status');

  return {
    types: incidentTypes,
    severities: severities,
    statuses: statuses,
  };
}

export async function addToVectorStore(incident) {
  const { _id, type, description, latitude, longitude } = incident;
  const embedding = await generateEmbedding(`${type} ${description}`);

  await vectorStore.addDocuments([
    {
      id: _id.toString(),
      values: embedding,
      metadata: { 
        type, 
        description, 
        latitude, 
        longitude,
        reportId: _id
      }
    }
  ]);
}

export async function updateVectorStore(incident) {
  const { _id, type, description, latitude, longitude } = incident;
  const embedding = await generateEmbedding(`${type} ${description}`);

  await vectorStore.update([
    {
      id: _id.toString(),
      values: embedding,
      metadata: { 
        type, 
        description, 
        latitude, 
        longitude,
        reportId: _id
      }
    }
  ]);
}

export async function deleteFromVectorStore(incidentId) {
  await vectorStore.delete([incidentId.toString()]);
}

async function generateEmbedding(text) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}
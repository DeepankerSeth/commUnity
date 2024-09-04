console.log('Loading searchService.js');
import { PineconeStore } from '@langchain/pinecone';
import { OpenAI } from '@langchain/openai';
import pinecone, { getIndex } from '../db/pinecone.js';  // Import pinecone and getIndex
import { OpenAIEmbeddings } from '@langchain/openai';
import { initializeVectorStore } from '../utils/vectorStoreInitializer.js';
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";  // Updated import
import { FuzzySearch } from 'fuzzy-search';

const index = getIndex(process.env.PINECONE_INDEX);

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY_NEW }),
  { pineconeIndex: index }
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
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_NEW });
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
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
  const { id, type, description, latitude, longitude } = incident;
  const embedding = await generateEmbedding(`${type} ${description}`);

  const vectorStore = await initializeVectorStore();
  await vectorStore.update([
    {
      id: id,
      values: embedding,
      metadata: { 
        type, 
        description, 
        latitude, 
        longitude,
        reportId: id
      }
    }
  ]);
}

export async function deleteFromVectorStore(incidentId) {
  const vectorStore = await initializeVectorStore();
  await vectorStore.delete([incidentId.toString()]);
}

async function generateEmbedding(text) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_NEW });
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });
  return response.data[0].embedding;
}

export async function performNaturalLanguageSearch(query) {
  const model = new ChatOpenAI({ modelName: "gpt-4" });  // Updated model name
  const embeddings = new OpenAIEmbeddings();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex });
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const response = await chain.call({
    query: query,
  });

  return {
    answer: response.text,
    sourceDocuments: response.sourceDocuments
  };
}
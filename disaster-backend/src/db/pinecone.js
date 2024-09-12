import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  //environment: process.env.PINECONE_ENVIRONMENT
});

export default pinecone;

// Utility functions
export const getIndex = (indexName) => pinecone.Index(indexName);

export const createIndex = async (indexName, dimension) => {
  await pinecone.createIndex({
    name: indexName,
    dimension: dimension,
    metric: 'cosine'
  });
};

export const upsertVectors = async (indexName, vectors) => {
  const index = getIndex(indexName);
  await index.upsert(vectors);
};

export const queryVectors = async (indexName, queryVector, topK) => {
  const index = getIndex(indexName);
  return await index.query({
    vector: queryVector,
    topK: topK,
    includeMetadata: true
  });
};
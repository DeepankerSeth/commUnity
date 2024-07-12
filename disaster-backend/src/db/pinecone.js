import { PineconeClient } from 'pinecone-node';

const client = new PineconeClient(process.env.PINECONE_API_KEY);

const createIndex = async (indexName) => {
  await client.createIndex(indexName);
};

const upsertVectors = async (indexName, vectors) => {
  await client.upsert(indexName, vectors);
};

const queryVectors = async (indexName, queryVector, topK) => {
  const results = await client.query(indexName, queryVector, topK);
  return results;
};

export { createIndex, upsertVectors, queryVectors };
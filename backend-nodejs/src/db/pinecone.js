const { PineconeClient } = require('pinecone-node');

const client = new PineconeClient(process.env.PINECONE_API_KEY);

const createIndex = async (indexName, dimension) => {
  await client.createIndex(indexName, dimension);
  console.log(`Index ${indexName} created`);
};

const upsertVectors = async (indexName, vectors) => {
  await client.upsert(indexName, vectors);
};

const queryVectors = async (indexName, queryVector) => {
  const results = await client.query(indexName, queryVector);
  return results;
};

module.exports = { createIndex, upsertVectors, queryVectors };

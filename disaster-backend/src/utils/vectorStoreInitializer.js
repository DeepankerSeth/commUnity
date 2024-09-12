console.log('Loading vectorStoreInitializer.js');

import { PineconeStore } from '@langchain/pinecone';
import pinecone from '../db/pinecone.js';
import { OpenAIEmbeddings } from '@langchain/openai';

let vectorStore;

export async function initializeVectorStore() {
  if (!vectorStore) {
    const indexName = process.env.PINECONE_INDEX;
    let index;

    try {
      // Try to get the existing index
      index = pinecone.Index(indexName);
      console.log(`Using existing Pinecone index: ${indexName}`);
    } catch (error) {
      // If the index doesn't exist, create it
      if (error.message.includes('Index not found')) {
        console.log(`Creating Pinecone index: ${indexName}`);
        await pinecone.createIndex({
          name: indexName,
          dimension: 3072,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        // Wait for the index to be ready
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds
        index = pinecone.Index(indexName);
      } else {
        throw error; // Re-throw if it's a different error
      }
    }

    const embeddings = new OpenAIEmbeddings({ 
      openAIApiKey: process.env.UPDATED_OPEN_AI_API_KEY,
      modelName: "text-embedding-3-large"
    });

    vectorStore = await PineconeStore.fromExistingIndex(
      embeddings,
      { pineconeIndex: index }
    );
  }
  return vectorStore;
}

export async function addToVectorStore(document) {
  const store = await initializeVectorStore();
  await store.addDocuments([document]);
}

export async function searchVectorStore(query, k = 5) {
  const store = await initializeVectorStore();
  return await store.similaritySearch(query, k);
}

export async function deleteFromVectorStore(ids) {
  const store = await initializeVectorStore();
  await store.delete(ids);
}

export async function updateInVectorStore(id, document) {
  const store = await initializeVectorStore();
  await store.delete([id]);
  await store.addDocuments([{ ...document, id }]);
}

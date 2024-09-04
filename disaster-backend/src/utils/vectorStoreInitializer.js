console.log('Loading vectorStoreInitializer.js');

import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAIEmbeddings } from '@langchain/openai';

const pinecone = new Pinecone({
  apiKey: "44acb654-e36a-4909-ad1b-3ffe62c3f62e",
  //environment: "us-east-1-aws"
});

let vectorStore;

export async function initializeVectorStore() {
  if (!vectorStore) {
    const indexName = "community-incidents";
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

    vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: "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" }),
      { pineconeIndex: index }
    );
  }
  return vectorStore;
}

import { OpenAI } from "langchain/llms/openai";
import { Pinecone } from "@pinecone-database/pinecone";

export const openai = new OpenAI({
  openAIApiKey: process.env.UPDATED_OPEN_AI_API_KEY,
  temperature: 0.7,
});

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Environment variables loaded');
console.log('OPENAI_API_KEY in .env:', process.env.OPENAI_API_KEY);
console.log('PINECONE_API_KEY in .env:', process.env.PINECONE_API_KEY);
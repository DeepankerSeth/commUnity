import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const storage = new Storage();
const bucketName = process.env.GCLOUD_STORAGE_BUCKET;

async function uploadFile(file) {
  const destination = path.basename(file.path);
  await storage.bucket(bucketName).upload(file.path, {
    destination: destination,
  });
  const fileUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
  return fileUrl;
}

export { uploadFile };
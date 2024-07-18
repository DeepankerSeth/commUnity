import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const storage = new Storage();
const bucketName = process.env.GCLOUD_STORAGE_BUCKET;

async function uploadFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/heif' , 'image/hevc' , 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel'];
  const maxSize = 300 * 1024 * 1024; // 300MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds the limit');
  }

  const destination = path.basename(file.path);
  await storage.bucket(bucketName).upload(file.path, {
    destination: destination,
  });
  const fileUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
  return fileUrl;
}

export { uploadFile };
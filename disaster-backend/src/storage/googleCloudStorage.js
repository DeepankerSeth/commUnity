import { Storage } from '@google-cloud/storage';
import path from 'path';

const storage = new Storage();

const bucketName = 'your-bucket-name';

const uploadFile = async (filePath) => {
  try {
    await storage.bucket(bucketName).upload(filePath, {
      destination: path.basename(filePath),
    });
    console.log(`${filePath} uploaded to ${bucketName}`);
  } catch (error) {
    console.error(`Failed to upload ${filePath} to ${bucketName}:`, error);
    throw new Error('Failed to upload file');
  }
};

export { uploadFile };
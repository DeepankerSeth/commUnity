import { Storage } from '@google-cloud/storage';
import path from 'path';

const storage = new Storage();

const bucketName = 'your-bucket-name';

const uploadFile = async (filePath) => {
  await storage.bucket(bucketName).upload(filePath, {
    destination: path.basename(filePath),
  });
  console.log(`${filePath} uploaded to ${bucketName}`);
};

export { uploadFile };
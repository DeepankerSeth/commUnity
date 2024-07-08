const { Storage } = require('@google-cloud/storage');
const path = require('path');
const dotenv = require('dotenv');
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

module.exports = { uploadFile };
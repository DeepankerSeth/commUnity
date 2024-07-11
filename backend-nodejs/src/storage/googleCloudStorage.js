const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage();

const bucketName = 'your-bucket-name';

const uploadFile = async (filePath) => {
  await storage.bucket(bucketName).upload(filePath, {
    destination: path.basename(filePath),
  });
  console.log(`${filePath} uploaded to ${bucketName}`);
};

module.exports = { uploadFile };

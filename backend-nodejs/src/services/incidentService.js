const mongoose = require('../config/mongodb');
const db = require('../config/postgres');
const { uploadFile } = require('./storageService');
const Incident = require('../models/incidentModel');

// Placeholder function for generating embeddings (to be implemented with your LLM)
async function generateEmbedding(text) {
  // Implement your embedding generation logic here
  return Array(512).fill(0); // Example: returning a dummy embedding
}

async function storeIncident(file, metadata) {
  // Upload file to Google Cloud Storage
  const fileUrl = await uploadFile(file);

  // Store metadata in MongoDB
  const metadataWithUrl = { ...metadata, fileUrl: fileUrl };
  const incident = new Incident(metadataWithUrl);
  await incident.save();

  // Generate and store embedding in MongoDB Atlas
  const embedding = await generateEmbedding(metadata.description);
  incident.embedding = embedding;
  await incident.save();

  // Store structured data in PostgreSQL
  await db.none('INSERT INTO incidents (id, user_id, description) VALUES ($1, $2, $3)', [
    incident._id,
    metadata.userId,
    metadata.description,
  ]);

  return incident;
}

module.exports = { storeIncident };
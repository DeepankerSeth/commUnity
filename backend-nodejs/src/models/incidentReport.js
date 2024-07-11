
// src/models/incidentReport.js
const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
  userId: String,
  timestamp: { type: Date, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  type: String,
  description: String,
  mediaUrls: [String],
  vectorId: String, // Reference to the vector in Pinecone
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncidentReport', incidentReportSchema);
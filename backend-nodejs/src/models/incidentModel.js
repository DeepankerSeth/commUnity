const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  description: { type: String, required: true },
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  fileUrl: { type: String, required: true },
  embedding: { type: [Number], default: [] }, // Embedding field
});

const Incident = mongoose.model('Incident', incidentSchema);
module.exports = Incident;
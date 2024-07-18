import mongoose from 'mongoose';

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
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }, // Add severity field
  updatedAt: { type: Date, default: Date.now }
});

// Static method to find incidents near a location
incidentReportSchema.statics.findNearLocation = function (latitude, longitude, maxDistance) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance
      }
    }
  }).sort({ status: -1, severity: -1 }); // Sort by status and severity
};

export default mongoose.model('IncidentReport', incidentReportSchema);
import mongoose from 'mongoose';

const incidentReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  mediaUrls: [{ type: String }],
  severity: { type: Number, default: 0 },
  impactRadius: { type: Number, default: 0 },
  analysis: { type: String },
  timeline: [{
    update: { type: String, required: true },
    severity: { type: Number },
    impactRadius: { type: Number },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

incidentReportSchema.index({ location: '2dsphere' });

const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);

export default IncidentReport;
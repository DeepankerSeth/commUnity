import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: String,
  urgency: String,
  message: String,
  riskScore: Number,
  incidentId: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);

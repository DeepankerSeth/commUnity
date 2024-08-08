import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  placeId: { type: String, required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  geohash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

locationSchema.index({ geohash: 1 });

const Location = mongoose.model('Location', locationSchema);

export default Location;

// server.js
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import speech from '@google-cloud/speech';
import mongoose from 'mongoose';
import app from './app.js';
import { monitorIncidents } from './src/workers/monitorIncidents.js';
import { createIncidentReport, getIncidentUpdates, processIncident, getIncidentTimeline } from './src/ai/llmProcessor.js';
import cors from 'cors';
import { checkSimilarIncidentsAndNotify } from './src/services/notificationService';
import http from 'http';

// Initialize Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Initialize Google Cloud Speech-to-Text client
const speechClient = new speech.SpeechClient();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const port = process.env.PORT || 0;
const server = http.createServer(app);

export { server };

app.use(express.json());

// Add CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * API endpoint for reporting incidents
 * Accepts media (will only support photos currently), and file uploads along with a description
 */

// Report an incident
app.post('/api/incidents', upload.array('media', 5), async (req, res) => {
  try {
    const { userId, type, description, latitude, longitude } = req.body;
    const mediaFiles = req.files;

    // Upload media files to Google Cloud Storage
    const mediaUrls = await Promise.all(mediaFiles.map(async (file) => {
      const blob = bucket.file(`${Date.now()}-${file.originalname}`);
      const blobStream = blob.createWriteStream();

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => resolve(blob.publicUrl()));
        blobStream.end(file.buffer);
      });
    }));

    // Create incident report
    const incidentData = { userId, type, description, latitude, longitude, mediaUrls };
    const incidentReport = await createIncidentReport(incidentData);

    // Process the incident
    const analysis = await processIncident(incidentReport);

    // Update the incident report with the analysis
    incidentReport.analysis = analysis.analysis;
    incidentReport.severity = analysis.severity;
    incidentReport.impactRadius = analysis.impactRadius;
    await incidentReport.save();

    // Check for similar incidents and send notifications if necessary
    await checkSimilarIncidentsAndNotify(incidentReport);

    res.status(201).json({ 
      message: 'Incident reported and analyzed successfully', 
      incidentId: incidentReport._id,
      analysis: analysis.analysis,
      severity: analysis.severity,
      impactRadius: analysis.impactRadius
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while reporting and analyzing the incident' });
  }
});

// Get incident updates
app.get('/api/incidents/:id/updates', async (req, res) => {
  try {
    const incidentId = req.params.id;
    const analysis = await getIncidentUpdates(incidentId);
    res.json({ update: analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching incident updates' });
  }
});

// Handle voice input
app.post('/api/incidents/voice', upload.single('audio'), async (req, res) => {
  try {
    const audio = req.file;
    const audioBytes = audio.buffer.toString('base64');

    const [response] = await speechClient.recognize({
      audio: { content: audioBytes },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
    });

    const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
    res.status(200).json({ transcription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the audio' });
  }
});

// Start the incident monitoring worker
monitorIncidents().catch(error => console.error('Error in monitorIncidents:', error));

export default app;
// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech');
const mongoose = require('mongoose');
const IncidentReport = require('./models/incidentReport');
const app = require('./app');
const upload = multer({ dest: 'uploads/' });

// Import the monitorIncidents function
const { monitorIncidents } = require('./workers/monitorIncidents');

// Import functions from llmProcessor.js
const { createIncidentReport, getIncidentUpdates } = require('./src/ai/llmProcessor');

// Initialize Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// Initialize Google Cloud Speech-to-Text client
const speechClient = new speech.SpeechClient();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

/**
 * API endpoint for reporting incidents
 * Accepts photo, and file uploads along with a description
 */

// Report an incident
app.post('/api/incidents', upload.array('media'), async (req, res) => {
  try {
    const { userId, type, description, latitude, longitude } = req.body;
    const mediaFiles = req.files;

    // Upload media files to Google Cloud Storage
    const mediaUrls = await Promise.all(mediaFiles.map(async (file) => {
      const blob = bucket.file(file.originalname);
      await blob.save(file.buffer);
      return blob.publicUrl();
    }));

    // Create incident report
    const incidentData = { userId, type, description, latitude, longitude, mediaUrls };
    const incidentReport = await createIncidentReport(incidentData);

    res.status(201).json({ message: 'Incident reported successfully', incidentId: incidentReport._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while reporting the incident' });
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
monitorIncidents();

module.exports = app;
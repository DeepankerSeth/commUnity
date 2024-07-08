const express = require('express');
const multer = require('multer');
const { processIncident, updateIncident } = require('./llmProcessor');

const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

/**
 * API endpoint for reporting incidents
 * Accepts photo, video, and file uploads along with a description
 */
app.post('/api/report', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
  try {
    const { description } = req.body;
    const photo = req.files['photo'] ? req.files['photo'][0].buffer.toString('base64') : null;
    const video = req.files['video'] ? req.files['video'][0].buffer.toString('base64') : null;
    const file = req.files['file'] ? req.files['file'][0].buffer.toString('base64') : null;

    // Insert new incident report into Supabase
    const { data, error } = await supabase
      .from('incidents')
      .insert([{ description, photo, video, file }]);

    if (error) throw error;

    const incident = data[0];

    // Process the incident with the LLM
    const analysis = await processIncident(incident);
    await updateIncident(incident.id, { description, analysis });

    res.status(200).json({ ...incident, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

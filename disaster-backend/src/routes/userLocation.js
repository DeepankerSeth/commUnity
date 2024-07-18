import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/location', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Address query parameter is required' });
    }

    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(500).json({ error: 'Failed to fetch location data' });
    }

    const location = response.data.results[0].geometry.location;
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
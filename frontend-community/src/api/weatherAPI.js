import axios from 'axios';

export default async function handler(req, res) {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(`http://localhost:3000/api/weatherAPI`, {
      params: { lat, lon }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
}

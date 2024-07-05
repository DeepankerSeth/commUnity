// src/services/weatherService.js

const axios = require('axios');

const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat: lat,
        lon: lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric' // Use 'imperial' for Fahrenheit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

module.exports = { getWeatherData };
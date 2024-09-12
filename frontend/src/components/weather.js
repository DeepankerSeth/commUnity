import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Weather = ({ lat, lon }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('/api/weatherAPI', {
          params: { lat, lon }
        });
        setWeather(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  return (
    <div>
      {weather ? (
        <div>
          <h2>Weather in {weather.name}</h2>
          <p>{weather.weather[0].description}</p>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
        </div>
      ) : (
        'Loading weather data...'
      )}
    </div>
  );
};

export default Weather;
import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setError('');
    setWeather(null);
    if (!city) {
      setError('Please enter a city name.');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/weather?city=${city}`);
      if (!response.ok) {
        throw new Error('City not found. Please try again.');
      }
  
      const data = await response.json();
      const weatherData = {
        city: data.city,
        temp: data.temp,
        description: data.description,
        humidity: data.humidity,
      };
      setWeather(weatherData);
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className="app-container">
      <h1 className="app-title">Weather App</h1>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className="search-button" onClick={fetchWeather}>
          Get Weather
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {weather && (
        <div className="weather-info">
          <h2 className="city-name">{weather.city}</h2>
          <p className="temperature">🌡️ Temperature: {weather.temp}°C</p>
          <p className="description">🌤️ {weather.description}</p>
          <p className="humidity">💧 Humidity: {weather.humidity}%</p>
        </div>
      )}
    </div>
  );
};

export default App;
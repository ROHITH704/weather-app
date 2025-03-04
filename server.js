import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';  // You need to install 'node-fetch'

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Update this to match your frontend URL
    methods: 'GET',
    credentials: true,
  }));
  
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Weather Schema and Model
const WeatherQuerySchema = new mongoose.Schema({
  city: { type: String, required: true },
  temp: Number,
  description: String,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

const WeatherQuery = mongoose.model('WeatherQuery', WeatherQuerySchema);

// API Endpoint
app.get('/api/weather', async (req, res) => {
    const city = req.query.city;
    console.log(`Received city: ${city}`);  // Add a log to track incoming requests
    const apiKey = process.env.API_KEY;
  
    if (!city) {
      return res.status(400).json({ error: 'City is required.' });
    }
  
    try {
      console.log(`Fetching weather data for city: ${city}`);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
  
      if (!response.ok) {
        console.log(`Error fetching weather data: ${response.statusText}`);
        return res.status(404).json({ error: 'City not found.' });
      }
  
      const data = await response.json();
      console.log('Weather data fetched:', data);
  
      // Save the data to MongoDB
      const weatherData = new WeatherQuery({
        city: data.name,
        temp: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
      });
  
      try {
        await weatherData.save();
        console.log('Weather data saved successfully.');
      } catch (error) {
        console.error('Error saving weather data:', error);
      }
  
      res.json({
        city: data.name,
        temp: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
      });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const axios = require('axios');
const User = require('../models/userModel');

// Fetching location from IP
const fetchLocationFromIP = async () => {
  try {
    const response = await axios.get(`${process.env.IP_LOOKUP_API_BASE_URL}`);
    const locationString = response.data.location;
    const [city, country] = locationString.split(",").map(item => item.trim());

    return { city, region: "", country };
  } catch (error) {
    console.error('Error fetching location:', error);
    return 'Location not available';
  }
};

// Fetching weather for a given city
const fetchWeather = async (city) => {
  try {
    const response = await axios.get(`${process.env.WEATHER_API_BASE_URL}/weather`, {
      params: { city, units: 'metric' },
      headers: {
        'X-RapidAPI-Key': process.env.WEATHER_API_KEY,
        'X-RapidAPI-Host': 'weather-api99.p.rapidapi.com'
      }
    });

    const { weather, main } = response.data;
    return `Temperature: ${main.temp}°C, Condition: ${weather[0].description}`;
  } catch (error) {
    console.error('Unable to fetch weather:', error.response?.data || error.message);
    return 'Weather not available';
  }
};


exports.createUser = async (req, res) => {
  try {
    const { name, age, gender, phone, email } = req.body;

    const location = await fetchLocationFromIP();
    const { city, country } = location;

    const weather = await fetchWeather(city);

    const newUser = new User({
      name,
      age,
      gender,
      phone,
      email,
      city, 
      country, 
      weather 
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id); 
    if (user) {
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { name, age, gender, phone, email } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.age = age || user.age;
      user.gender = gender || user.gender;
      user.phone = phone || user.phone;
      user.email = email || user.email;

      const location = await fetchLocationFromIP();
      user.city = location.city || user.city;
      user.country = location.country || user.country;

      user.weather = await fetchWeather(user.city) || user.weather;

      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


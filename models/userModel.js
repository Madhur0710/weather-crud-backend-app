const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, default: 'Unknown city' }, 
  region: { type: String, default: '' },
  country: { type: String, default: 'Unknown country' }, 
  weather: { type: String, default: 'Weather not available' } 
});

module.exports = mongoose.model('User', userSchema);

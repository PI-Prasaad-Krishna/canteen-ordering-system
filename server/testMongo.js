const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Test Connection: SUCCESS'))
  .catch(err => console.log('MongoDB Test Connection: FAILED', err));

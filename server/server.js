const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env file from the correct directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log("TEST_ENV_VAR:", process.env.TEST_ENV_VAR);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("Current working directory:", __dirname);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Canteen Ordering System API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

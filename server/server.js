const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');  // Import User model

// Explicitly load .env file from the correct directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Log the environment variables for debugging
console.log("TEST_ENV_VAR:", process.env.TEST_ENV_VAR);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("Current working directory:", __dirname);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

// MongoDB connection with increased timeout
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,  // 10-second timeout
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// JWT Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Authorization required' });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;  // Attach the decoded user info to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup Route (User Registration)
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error(error); // Log error for debugging purposes
    res.status(500).json({ error: error.message });
  }
});

// Login Route (User Authentication)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Fetch the secret key from the .env file
    const secretKey = process.env.JWT_SECRET_KEY;

    // Generate JWT token with the secret key
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error); // Log error for debugging purposes
    res.status(500).json({ error: error.message });
  }
});

// Protected Route Example (Only for authenticated users)
app.get('/protected', authenticate, (req, res) => {
  res.send('You have access to this protected route!');
});

// Default route
app.get('/', (req, res) => {
  res.send('Canteen Ordering System API');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

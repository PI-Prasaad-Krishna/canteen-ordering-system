const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');  // Import User model
const Order = require('./models/Order'); // Import Order model (Make sure you have it)
const Menu = require('./models/Menu');  // Import Menu model
const orderRoutes = require('./routes/orderRoutes'); // Import order routes

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

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

// ✅ **New API Route to Fetch Menu Data**
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await Menu.find();  // Fetch all menu items from MongoDB
    res.json(menu);  // Send back the menu data as JSON
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Error fetching menu", error });
  }
});

// JWT Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: 'Authorization required' });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    const tokenValue = token.split(' ')[1];  // Extract token part after 'Bearer'
    console.log("🔹 Token from Authorization Header:", tokenValue);

    if (!secretKey) {
      console.error("❌ JWT_SECRET_KEY is missing in .env");
      return res.status(500).json({ message: "Server error: JWT secret key is missing" });
    }

    const decoded = jwt.verify(tokenValue, secretKey);
    req.user = decoded; // Attach user information to the request object
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup Route (User Registration)
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Ensure the role is valid
  if (!["student", "admin"].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be either "student" or "admin".' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error(error);
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

    // Generate JWT token
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ message: "Server error: JWT secret key is missing" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    console.log("Generated Token:", token);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ **Order Route (Place an Order)**
app.post('/api/order', authenticate, async (req, res) => {
  const { canteenId, items } = req.body;

  // Ensure the user is authenticated
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Create a new order with the authenticated user
    const newOrder = new Order({
      user: req.user.userId,  // Use the userId from the decoded JWT
      canteenId,
      items,
      status: "Pending",  // Default order status
    });

    // Save the order to the database
    await newOrder.save();
    res.status(201).json({ orderId: newOrder._id, message: "Order placed successfully!" });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    res.status(500).json({ message: "Error placing order", error });
  }
});

// Protected Route Example (Only for authenticated users)
app.get('/protected', authenticate, (req, res) => {
  res.send('You have access to this protected route!');
});

// Use order routes
app.use('/api', orderRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Canteen Ordering System API');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

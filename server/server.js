const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Order = require('./models/Order');
const Menu = require('./models/Menu');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.get('/api/menu', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Error fetching menu", error });
  }
});

const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Authorization required' });

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    const tokenValue = token.split(' ')[1];
    const decoded = jwt.verify(tokenValue, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["student", "admin"].includes(role)) return res.status(400).json({ message: 'Invalid role' });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/order', authenticate, async (req, res) => {
  const { canteenId, items, totalPrice } = req.body;
  const studentId = req.user.userId;

  if (!studentId || !canteenId || !items || !totalPrice) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  for (const item of items) {
    if (!item.foodId || !item.quantity || !item.price || !item.counterId) {
      return res.status(400).json({ message: "Each item must have foodId, quantity, price, and counterId" });
    }
  }

  try {
    const otpCodes = items.map(item => ({
      counterId: item.counterId,
      otpCode: Math.floor(100000 + Math.random() * 900000).toString()
    }));

    const newOrder = new Order({
      studentId,
      canteenId,
      items,
      totalPrice,
      status: "Pending",
      paymentStatus: "Unpaid",
      otp: otpCodes,
    });

    await newOrder.save();
    res.status(201).json({ orderId: newOrder._id, message: "Order placed successfully!", otp: otpCodes });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error });
  }
});

app.use('/api', orderRoutes);

app.get('/', (req, res) => {
  res.send('Canteen Ordering System API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

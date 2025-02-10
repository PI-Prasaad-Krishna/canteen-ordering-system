const express = require('express');
const Order = require('../models/Order'); // Import Order model
const crypto = require('crypto'); // For OTP generation
const authenticate = require('../middleware/authenticate'); // Correct path

const router = express.Router();

// Create order
router.post('/order', authenticate, async (req, res) => {
  const { canteenId, items } = req.body;
  const studentId = req.user.userId; // Extract student ID from JWT

  try {
    const otpArray = items.map(item => ({
      counterId: item.counterId,
      otpCode: crypto.randomBytes(3).toString('hex'), // Generate a 6-character OTP
    }));

    const newOrder = new Order({
      studentId,
      canteenId,
      items,
      otp: otpArray,
    });

    await newOrder.save();
    res.status(201).json({ orderId: newOrder._id, otp: otpArray });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get order status
router.get('/order-status/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('studentId', 'name email') // Populate student details
      .populate('items.foodId', 'name price'); // Populate food details

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      orderId: order._id,
      student: order.studentId,
      canteenId: order.canteenId,
      items: order.items.map(item => ({
        counterId: item.counterId,
        foodId: item.foodId,
        price: item.price
      })),
      otp: order.otp,
      status: order.status,
      paymentStatus: order.paymentStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP at the counter
router.post('/verify-otp', authenticate, async (req, res) => {
  const { orderId, counterId, otpCode } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the OTP matches
    const otpEntry = order.otp.find(otp => otp.counterId === counterId && otp.otpCode === otpCode);
    if (!otpEntry) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark order as in progress or delivered
    order.status = 'In Progress';
    await order.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
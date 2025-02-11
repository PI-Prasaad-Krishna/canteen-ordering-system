const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order'); // Import Order model
const Menu = require('../models/Menu'); // Import Menu model
const otpGenerator = require('otp-generator'); // OTP generator
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

// ✅ Create order
router.post('/order', authenticate, async (req, res) => {
  const { canteenId, items } = req.body;
  const studentId = req.user.userId; // Extract student ID from JWT

  try {
    // ✅ Validate `_id` before querying MongoDB
    const menuIds = items.map(item => item._id);
    const validMenuIds = menuIds.filter(id => mongoose.Types.ObjectId.isValid(id)); // Keep only valid IDs

    if (validMenuIds.length === 0) {
      return res.status(400).json({ message: 'Invalid menu item IDs provided' });
    }

    // ✅ Fetch menu items using _id and get price, counterId
    const menuItems = await Menu.find({ _id: { $in: validMenuIds } });

    if (menuItems.length === 0) {
      return res.status(404).json({ message: 'No valid menu items found' });
    }

    // ✅ Map menu details to order items
    const updatedItems = items.map(item => {
      const menuItem = menuItems.find(menu => menu._id.toString() === item._id);
      if (!menuItem) {
        throw new Error(`Menu item with ID ${item._id} not found`);
      }
      return {
        foodId: menuItem._id,  // ✅ Assign `_id` from Menu collection to `foodId`
        quantity: item.quantity,
        price: menuItem.price,  // ✅ Get price from Menu
        counterId: menuItem.counterId  // ✅ Get counterId from Menu
      };
    });

    // ✅ Create and save the order
    const newOrder = new Order({
      studentId,
      canteenId,
      items: updatedItems,
      status: "Pending"
    });

    await newOrder.save();
    res.status(201).json({ orderId: newOrder._id, items: updatedItems });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get order status
router.get('/order-status/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('studentId', 'name email') // Populate student details
      .populate('items.foodId', 'name price counterId'); // ✅ Fix: Populate `foodId`, not `_id`

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      orderId: order._id,
      student: order.studentId,
      canteenId: order.canteenId,
      items: order.items.map(item => ({
        counterId: item.counterId,
        foodId: item.foodId,  // ✅ Ensure `foodId` is populated
        price: item.price
      })),
      status: order.status,
      paymentStatus: order.paymentStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Generate OTP for a specific counter
router.post('/order-status/:id/generate-otp', authenticate, async (req, res) => {
  try {
    const { counterId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ✅ Check if counter exists in order items
    const counterExists = order.items.some(item => item.counterId === counterId);
    if (!counterExists) {
      return res.status(400).json({ message: 'Counter ID not found in this order' });
    }

    // ✅ Generate a 6-digit numeric OTP
    const otpCode = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false });

    // ✅ Store OTP in the order object for the given counter
    const otpIndex = order.otp.findIndex(otp => otp.counterId === counterId);
    if (otpIndex !== -1) {
      order.otp[otpIndex].otpCode = otpCode; // Update OTP if it exists
    } else {
      order.otp.push({ counterId, otpCode }); // Add new OTP entry
    }

    await order.save();

    res.status(200).json({ message: 'OTP generated successfully!', otp: otpCode });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Error generating OTP' });
  }
});

// ✅ Verify OTP at the counter
router.post('/order-status/:id/verify-otp', authenticate, async (req, res) => {
  const { counterId, otpCode } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ✅ Find matching OTP for the given counter
    const otpEntry = order.otp.find(otp => otp.counterId === counterId && otp.otpCode === otpCode);
    if (!otpEntry) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ✅ Update order status
    order.status = 'In Progress';
    await order.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
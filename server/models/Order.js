const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the student who placed the order
    required: true,
  },
  canteenId: {
    type: String,
    required: true,
  },
  items: [
    {
      counterId: {
        type: String, 
        required: true,
      },
      foodId: {
        type: String, 
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  otp: [
    {
      counterId: {
        type: String,
        required: true,
      },
      otpCode: {
        type: String,
        required: true,
      },
    },
  ],
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Delivered'],
    default: 'Pending',
  },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;

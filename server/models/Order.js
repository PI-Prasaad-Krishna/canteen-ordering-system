const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  canteenId: { type: String, required: true },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      counterId: { type: String, required: true }
    }
  ],
  status: { type: String, default: 'Pending' },
  paymentStatus: { type: String, default: 'Unpaid' },
  totalPrice: { type: Number, required: true },
  otp: [
    {
      counterId: { type: String, required: true },
      otpCode: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Order', orderSchema);

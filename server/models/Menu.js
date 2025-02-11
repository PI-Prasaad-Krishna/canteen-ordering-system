const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  counterId: { type: String, required: true } // Assigns food to a counter
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
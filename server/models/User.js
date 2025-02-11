const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensures no duplicate emails
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],  // User can be either a student or an admin
    default: 'student',  // Default to 'student'
  },
}, { timestamps: true });  // Adds createdAt and updatedAt fields automatically

// Export the model
module.exports = mongoose.model('User', UserSchema);
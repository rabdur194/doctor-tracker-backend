const mongoose = require('mongoose');

/**
 * Doctor Schema
 * Fields: name, specialization, hospital, phone, email
 * Indexing for search, filter, pagination performance
 */
const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      index: true, // Index for fast search
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true, // Index for filtering by specialization
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true, // createdAt used for date-wise filtering
  }
);

// Compound index for common query patterns (search + date filter)
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });
doctorSchema.index({ createdAt: -1 }); // For date-wise sorting/filtering

module.exports = mongoose.model('Doctor', doctorSchema);

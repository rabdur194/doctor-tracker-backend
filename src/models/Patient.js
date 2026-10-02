const mongoose = require('mongoose');

/**
 * Patient Schema
 * Linked to a Doctor
 * Fields include condition for filtering
 */
const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age seems invalid'],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      trim: true,
      index: true, // For patient-condition filtering
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    // Reference to the doctor this patient belongs to
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
      index: true,
    },
  },
  {
    timestamps: true, // createdAt for date-wise filtering
  }
);

// Indexes for performance (search, filter, pagination)
patientSchema.index({ name: 'text', condition: 'text' });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ doctor: 1, createdAt: -1 }); // Common query: patients of a doctor sorted by date

module.exports = mongoose.model('Patient', patientSchema);

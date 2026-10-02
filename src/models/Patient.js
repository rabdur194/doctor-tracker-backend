const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name Required"],
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // enum: only accept these
    },
    condition: {
      type: String,
      trim: true,
      index: true, // filter + pie chart by condition
    },
    phone: {
      type: String,
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor name required"],
      index: true, //single-field index for fast filters/aggregations. Without an index, MongoDB scans the whole collection
    },
  },
  { timestamps: true },
);
patientSchema.index({ name: "text", condition: "text" }); //Creates a text index for search
module.exports = mongoose.model("Patient", patientSchema);

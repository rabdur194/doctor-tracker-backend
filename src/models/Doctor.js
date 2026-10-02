const mongoose = require("mongoose");
const docotrSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor Name Required"],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization Required"],
      trim: true,
      index: true, //faster filtering by specialization
    },
    hospital: {
      type: String,
      required: [true, "Hopsital name is Required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }, // needed for date-wise filter, adds createdAt, updatedAt automatically
);

//Search for name/Hospital
docotrSchema.index({ name: "text", hospital: "text" });
module.exports = mongoose.model("Doctor", docotrSchema);

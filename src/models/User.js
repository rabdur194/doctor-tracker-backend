const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//stores admin login info -> email+hashed password
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name Required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password Required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true },
);

//Hashing passwords hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
//compare plain passwword with the hashing password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("User", userSchema);

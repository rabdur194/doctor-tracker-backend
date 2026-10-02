const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

//@route POST/api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400) //400= bad request
        .json({ message: "Email and Password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ message: "Invalid Email or Pasword" });
    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid Email or Password" });
    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//@route GET/api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};
module.exports = { login, getMe };

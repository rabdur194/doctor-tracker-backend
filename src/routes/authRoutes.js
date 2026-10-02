const express = require('express');
const { login, getMe, register } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register); // For initial admin setup

// Private route
router.get('/me', protect, getMe);

module.exports = router;

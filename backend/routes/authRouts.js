const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

// Stricter rate limiting for auth endpoints (5 attempts per minute)
const authLimiter = rateLimit(60000, 5);

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;

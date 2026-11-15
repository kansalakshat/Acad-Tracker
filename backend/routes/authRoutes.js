const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', protect, authController.getCurrentUser);
router.patch('/me', protect, authController.updateCurrentUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { login, changePassword, forgotPassword, resetPassword, getMe, updateProfile } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', requireAuth, changePassword); // used for first-login forced change too
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);

module.exports = router;
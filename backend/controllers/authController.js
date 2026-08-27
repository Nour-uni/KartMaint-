const crypto = require('crypto');
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');

const MAX_FAILED_ATTEMPTS = 5;

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ where: { email } });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return res.status(423).json({ message: 'Account locked. Contact your admin to unlock it.' });
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // effectively locked until admin unlocks
    }
    await user.save();
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  const token = signAccessToken(user);

  return res.json({
    token,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    fullName: user.fullName,
  });
}

async function changePassword(req, res) {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const user = req.user; // set by requireAuth middleware
  user.password = await hashPassword(newPassword);
  user.mustChangePassword = false;
  await user.save();

  return res.json({ message: 'Password updated successfully.' });
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  // Always respond the same way, whether or not the email exists — avoids leaking which emails are registered
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, resetLink);

  return res.json({ message: 'If that email exists, a reset link has been sent.' });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
    return res.status(400).json({ message: 'Reset link is invalid or expired.' });
  }

  user.password = await hashPassword(newPassword);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  user.mustChangePassword = false;
  await user.save();

  return res.json({ message: 'Password reset successfully. You can now log in.' });
}

async function getMe(req, res) {
  const user = req.user; // set by requireAuth middleware
  return res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  });
}

async function updateProfile(req, res) {
  const { fullName, currentPassword, newPassword } = req.body;
  const user = req.user;

  if (fullName) {
    user.fullName = fullName;
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required to set a new one.' });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    user.password = await hashPassword(newPassword);
  }

  await user.save();

  return res.json({
    message: 'Profile updated.',
    fullName: user.fullName,
  });
}

module.exports = { login, changePassword, forgotPassword, resetPassword, getMe, updateProfile };
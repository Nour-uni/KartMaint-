const User = require('../models/User');
const { hashPassword, generateTempPassword } = require('../utils/password');
const { sendTempPasswordEmail } = require('../utils/email');
const { logAction } = require('../utils/auditLog');

async function createAccount(req, res) {
  const { fullName, email, role } = req.body;

  if (!fullName || !email || !role) {
    return res.status(400).json({ message: 'fullName, email, and role are required.' });
  }

  if (!['controller', 'mechanic'].includes(role)) {
    return res.status(400).json({ message: 'Role must be controller or mechanic.' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await hashPassword(tempPassword);

  const user = await User.create({
    fullName,
    email,
    role,
    password: hashedPassword,
    mustChangePassword: true,
  });

  await sendTempPasswordEmail(email, tempPassword, fullName);
  await logAction(req, 'account_created', `Created ${role} account for ${fullName} (${email})`);

  return res.status(201).json({
    message: 'Account created and temporary password emailed.',
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
  });
}

async function listAccounts(req, res) {
  const users = await User.findAll({
    attributes: ['id', 'fullName', 'email', 'role', 'isActive', 'lockedUntil', 'createdAt'],
    where: { role: ['controller', 'mechanic'] },
  });
  return res.json(users);
}

async function activateAccount(req, res) {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  user.isActive = true;
  await user.save();

  return res.json({ message: 'Account reactivated.' });
}

async function deactivateAccount(req, res) {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  user.isActive = false;
  await user.save();
  await logAction(req, 'account_deactivated', `Deactivated account: ${user.email}`);

  return res.json({ message: 'Account deactivated.' });
}

async function unlockAccount(req, res) {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  return res.json({ message: 'Account unlocked.' });
}

module.exports = { createAccount, listAccounts, deactivateAccount, activateAccount, unlockAccount };
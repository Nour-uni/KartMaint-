const Notification = require('../models/Notification');
const User = require('../models/User');

async function notifyUser(userId, message) {
  try {
    await Notification.create({ userId, message });
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
}

async function notifyAdmins(message) {
  try {
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map((admin) => Notification.create({ userId: admin.id, message })));
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
}

module.exports = { notifyUser, notifyAdmins };
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

async function listMyNotifications(req, res) {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  return res.json(notifications);
}

async function markAsRead(req, res) {
  const { id } = req.params;
  const notification = await Notification.findOne({ where: { id, userId: req.user.id } });
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found.' });
  }
  notification.isRead = true;
  await notification.save();
  return res.json(notification);
}

async function markAllAsRead(req, res) {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  return res.json({ message: 'All notifications marked as read.' });
}

// Admin only
async function listAuditLogs(req, res) {
  const logs = await AuditLog.findAll({
    order: [['createdAt', 'DESC']],
    limit: 200,
  });
  return res.json(logs);
}

// Any logged-in user: their own action history (used for the mechanic's "Tasks" page, etc.)
async function listMyActivity(req, res) {
  const logs = await AuditLog.findAll({
    where: { actorId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
  return res.json(logs);
}

module.exports = { listMyNotifications, markAsRead, markAllAsRead, listAuditLogs, listMyActivity };
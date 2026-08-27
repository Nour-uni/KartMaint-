const express = require('express');
const router = express.Router();
const {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  listAuditLogs,
  listMyActivity,
} = require('../controllers/notificationController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, listMyNotifications);
router.patch('/:id/read', requireAuth, markAsRead);
router.patch('/read-all', requireAuth, markAllAsRead);
router.get('/audit-logs', requireAuth, requireRole('admin'), listAuditLogs);
router.get('/my-activity', requireAuth, listMyActivity);

module.exports = router;
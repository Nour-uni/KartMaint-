const AuditLog = require('../models/AuditLog');

async function logAction(req, action, details) {
  try {
    await AuditLog.create({
      actorId: req.user?.id || null,
      actorName: req.user?.fullName || 'System',
      action,
      details: details || null,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAction };
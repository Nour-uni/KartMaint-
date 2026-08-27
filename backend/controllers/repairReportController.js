const RepairReport = require('../models/RepairReport');
const User = require('../models/User');

// Mechanic: their own repair reports
async function listMyReports(req, res) {
  const reports = await RepairReport.findAll({
    where: { mechanicId: req.user.id },
    order: [['completedAt', 'DESC']],
  });
  return res.json(reports);
}

// Admin: every repair report, with mechanic name attached
async function listAllReports(req, res) {
  const reports = await RepairReport.findAll({
    include: [{ model: User, as: 'mechanic', attributes: ['id', 'fullName'] }],
    order: [['completedAt', 'DESC']],
  });
  return res.json(reports);
}

module.exports = { listMyReports, listAllReports };
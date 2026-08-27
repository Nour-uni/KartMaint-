const express = require('express');
const router = express.Router();
const { listMyReports, listAllReports } = require('../controllers/repairReportController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/mine', requireAuth, requireRole('mechanic'), listMyReports);
router.get('/', requireAuth, requireRole('admin'), listAllReports);

module.exports = router;
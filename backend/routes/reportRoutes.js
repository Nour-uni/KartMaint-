const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/reportController');
const { exportPdf, exportExcel } = require('../controllers/exportController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

router.get('/summary', getSummary);
router.get('/export/pdf', exportPdf);
router.get('/export/excel', exportExcel);

module.exports = router;
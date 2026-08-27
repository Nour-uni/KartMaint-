const express = require('express');
const router = express.Router();
const {
  createKart,
  listKarts,
  updateKart,
  deleteKart,
  updateStatus,
  takeCharge,
  completeRepair,
} = require('../controllers/kartController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Everyone logged in can view the fleet
router.get('/', requireAuth, listKarts);

// Admin only: manage the fleet itself
router.post('/', requireAuth, requireRole('admin'), createKart);
router.patch('/:id', requireAuth, requireRole('admin'), updateKart);
router.delete('/:id', requireAuth, requireRole('admin'), deleteKart);

// Controller only: daily functional / out_of_order check
router.patch('/:id/status', requireAuth, requireRole('controller'), updateStatus);

// Mechanic only: take charge of a repair and mark it complete
router.patch('/:id/take-charge', requireAuth, requireRole('mechanic'), takeCharge);
router.patch('/:id/complete-repair', requireAuth, requireRole('mechanic'), completeRepair);

module.exports = router;
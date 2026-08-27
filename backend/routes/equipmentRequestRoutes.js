const express = require('express');
const router = express.Router();
const {
  createRequest,
  listMyRequests,
  listAllRequests,
  approveRequest,
  rejectRequest,
} = require('../controllers/equipmentRequestController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Mechanic: create a request, view their own requests
router.post('/', requireAuth, requireRole('mechanic'), createRequest);
router.get('/mine', requireAuth, requireRole('mechanic'), listMyRequests);

// Admin: view all requests, approve/reject
router.get('/', requireAuth, requireRole('admin'), listAllRequests);
router.patch('/:id/approve', requireAuth, requireRole('admin'), approveRequest);
router.patch('/:id/reject', requireAuth, requireRole('admin'), rejectRequest);

module.exports = router;
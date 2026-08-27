const express = require('express');
const router = express.Router();
const {
  createAccount,
  listAccounts,
  deactivateAccount,
  activateAccount,
  unlockAccount,
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Every route here requires a logged-in admin
router.use(requireAuth, requireRole('admin'));

router.post('/accounts', createAccount);
router.get('/accounts', listAccounts);
router.patch('/accounts/:id/deactivate', deactivateAccount);
router.patch('/accounts/:id/activate', activateAccount);
router.patch('/accounts/:id/unlock', unlockAccount);

module.exports = router;
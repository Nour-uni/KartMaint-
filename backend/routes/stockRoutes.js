const express = require('express');
const router = express.Router();
const {
  createStockItem,
  listStockItems,
  updateStockItem,
  deleteStockItem,
} = require('../controllers/stockController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Every route here requires a logged-in admin — mechanics never get access to this router at all.
router.use(requireAuth, requireRole('admin'));

router.post('/', createStockItem);
router.get('/', listStockItems);
router.patch('/:id', updateStockItem);
router.delete('/:id', deleteStockItem);

module.exports = router;
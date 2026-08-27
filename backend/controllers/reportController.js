const Kart = require('../models/Kart');
const StockItem = require('../models/StockItem');
const EquipmentRequest = require('../models/EquipmentRequest');
const AuditLog = require('../models/AuditLog');

async function getSummary(req, res) {
  const karts = await Kart.findAll();
  const stockItems = await StockItem.findAll();
  const requests = await EquipmentRequest.findAll();

  const fleetStatus = {
    functional: karts.filter((k) => k.status === 'functional').length,
    out_of_order: karts.filter((k) => k.status === 'out_of_order').length,
    in_repair: karts.filter((k) => k.status === 'in_repair').length,
    total: karts.length,
  };

  const lowStockItems = stockItems
    .filter((item) => item.quantity <= item.lowStockThreshold)
    .map((item) => ({ name: item.name, quantity: item.quantity, threshold: item.lowStockThreshold }));

  const requestStats = {
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    total: requests.length,
  };

  const repairsCompletedCount = await AuditLog.count({ where: { action: 'kart_repair_completed' } });

  const recentActivity = await AuditLog.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  return res.json({
    fleetStatus,
    lowStockItems,
    requestStats,
    repairsCompletedCount,
    recentActivity,
  });
}

module.exports = { getSummary };
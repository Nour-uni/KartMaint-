// Set test environment variables if they aren't already set
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-321-go';
process.env.LOCKOUT_ATTEMPTS = process.env.LOCKOUT_ATTEMPTS || '5';

const sequelize = require('../config/database');

// Import all models to register them with the sequelize instance
const User = require('../models/User');
const Kart = require('../models/kart');
const StockItem = require('../models/StockItem');
const EquipmentRequest = require('../models/EquipmentRequest');
const Notification = require('../models/Notification');
const RepairReport = require('../models/RepairReport');
const AuditLog = require('../models/AuditLog');

async function initializeDatabase() {
  await sequelize.sync({ force: true });
}

module.exports = {
  sequelize,
  initializeDatabase,
  User,
  Kart,
  StockItem,
  EquipmentRequest,
  Notification,
  RepairReport,
  AuditLog,
};

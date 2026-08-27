const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Kart = require('./Kart');

const RepairReport = sequelize.define('RepairReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  kartId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: Kart, key: 'id' },
  },
  kartNumber: { type: DataTypes.STRING, allowNull: false }, // denormalized so the record survives if the kart is later deleted
  mechanicId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  cause: { type: DataTypes.STRING, allowNull: true }, // the reported issue / diagnosis
  startedAt: { type: DataTypes.DATE, allowNull: false },
  completedAt: { type: DataTypes.DATE, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
  equipmentUsed: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] }, // [{ itemName, quantity }]
}, {
  tableName: 'repair_reports',
  timestamps: true,
});

RepairReport.belongsTo(User, { as: 'mechanic', foreignKey: 'mechanicId' });

module.exports = RepairReport;
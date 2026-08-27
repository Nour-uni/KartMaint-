const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  actorId: { type: DataTypes.UUID, allowNull: true },
  actorName: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.STRING, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'audit_logs',
  timestamps: true,
});

module.exports = AuditLog;
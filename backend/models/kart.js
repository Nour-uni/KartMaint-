const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Kart = sequelize.define('Kart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  kartNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('functional', 'out_of_order', 'in_repair'),
    allowNull: false,
    defaultValue: 'functional',
  },
  reportedIssue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assignedMechanicId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  // Set when a mechanic takes charge, cleared when the repair completes.
  // Used to calculate repair duration and to find equipment used during this repair.
  repairStartedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'karts',
  timestamps: true,
});

Kart.belongsTo(User, { as: 'assignedMechanic', foreignKey: 'assignedMechanicId' });

module.exports = Kart;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Kart = require('./Kart');
const StockItem = require('./StockItem');

const EquipmentRequest = sequelize.define('EquipmentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // The mechanic types what they need by name — they never see the actual stock list.
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantityRequested: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  mechanicId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  kartId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: Kart, key: 'id' },
  },
  // Set by the admin when approving — links the free-text request to an actual stock item, used to deduct quantity.
  stockItemId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: StockItem, key: 'id' },
  },
}, {
  tableName: 'equipment_requests',
  timestamps: true,
});

EquipmentRequest.belongsTo(User, { as: 'mechanic', foreignKey: 'mechanicId' });
EquipmentRequest.belongsTo(Kart, { as: 'kart', foreignKey: 'kartId' });
EquipmentRequest.belongsTo(StockItem, { as: 'stockItem', foreignKey: 'stockItemId' });

module.exports = EquipmentRequest;
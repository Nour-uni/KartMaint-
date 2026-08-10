const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // will store the bcrypt hash, not plain text
  },
  role: {
    type: DataTypes.ENUM('admin', 'controller', 'mechanic'),
    allowNull: false,
  },
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // forces password change on first login
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  timestamps: true, // adds createdAt / updatedAt automatically
});

module.exports = User;
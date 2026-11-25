const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  vehicleNo: {
    type: DataTypes.STRING(50), // e.g. 'LEA-2024'
    allowNull: false,
    unique: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  driverName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  driverPhone: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  driverLicense: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'vehicles'
});

module.exports = Vehicle;


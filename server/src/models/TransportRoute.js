const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransportRoute = sequelize.define('TransportRoute', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(150), // e.g., 'Route 1 - Gulberg to School'
    allowNull: false
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  startPoint: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  endPoint: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  fareAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'transport_routes'
});

module.exports = TransportRoute;


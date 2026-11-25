const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RouteStop = sequelize.define('RouteStop', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stopName: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  pickupTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  dropTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  fare: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'route_stops'
});

module.exports = RouteStop;


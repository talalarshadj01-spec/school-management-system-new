const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeAdjustment = sequelize.define('FeeAdjustment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  feeVoucherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('discount', 'fine', 'scholarship', 'waiver'),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  approvedById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'fee_adjustments'
});

module.exports = FeeAdjustment;


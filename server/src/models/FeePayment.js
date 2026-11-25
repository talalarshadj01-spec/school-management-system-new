const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeePayment = sequelize.define('FeePayment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  receiptNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  feeVoucherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'cheque', 'pos'),
    defaultValue: 'cash'
  },
  transactionReference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  collectedById: {
    type: DataTypes.UUID,
    allowNull: true
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'fee_payments'
});

module.exports = FeePayment;


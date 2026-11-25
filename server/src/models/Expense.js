const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  category: {
    type: DataTypes.STRING(100), // 'Utility Bills', 'Salaries', 'Maintenance', 'Stationery', 'Rent', etc.
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque', 'online'),
    defaultValue: 'cash'
  },
  referenceNo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'expenses'
});

module.exports = Expense;


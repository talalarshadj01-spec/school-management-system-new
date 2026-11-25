const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Income = sequelize.define('Income', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  category: {
    type: DataTypes.STRING(100), // 'Fees', 'Donations', 'Canteen Rent', 'Grants', 'Uniform/Books', 'Other'
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
  incomeDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque', 'online'),
    defaultValue: 'cash'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receivedById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'incomes'
});

module.exports = Income;


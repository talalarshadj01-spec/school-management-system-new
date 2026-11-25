const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeCategory = sequelize.define('FeeCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100), // 'Tuition Fee', 'Admission Fee', 'Exam Fee', 'Transport Fee'
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  frequency: {
    type: DataTypes.ENUM('monthly', 'one_time', 'annual', 'term'),
    defaultValue: 'monthly'
  }
}, {
  tableName: 'fee_categories'
});

module.exports = FeeCategory;


const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeStructure = sequelize.define('FeeStructure', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  feeCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dueDateDay: {
    type: DataTypes.INTEGER, // e.g., 10th of every month
    defaultValue: 10
  }
}, {
  tableName: 'fee_structures',
  indexes: [
    {
      unique: true,
      fields: ['academic_session_id', 'class_id', 'fee_category_id']
    }
  ]
});

module.exports = FeeStructure;


const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(10), // 'A+', 'A', 'B', 'C', 'D', 'F'
    allowNull: false,
    unique: true
  },
  minPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  maxPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  gradePoint: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  remarks: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'grades'
});

module.exports = Grade;


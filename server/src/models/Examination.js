const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Examination = sequelize.define('Examination', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100), // 'First Term Examination 2026', 'Mid Term', 'Final Term'
    allowNull: false
  },
  examType: {
    type: DataTypes.ENUM('first_term', 'mid_term', 'final_term', 'monthly_test'),
    defaultValue: 'mid_term'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'examinations'
});

module.exports = Examination;


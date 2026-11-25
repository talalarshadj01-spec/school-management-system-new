const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AcademicSession = sequelize.define('AcademicSession', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50), // e.g., '2025-2026'
    allowNull: false,
    unique: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'completed'),
    defaultValue: 'upcoming'
  }
}, {
  tableName: 'academic_sessions'
});

module.exports = AcademicSession;


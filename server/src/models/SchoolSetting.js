const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SchoolSetting = sequelize.define('SchoolSetting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  group: {
    type: DataTypes.STRING(50), // 'general', 'finance', 'academics', 'grading', 'localization'
    defaultValue: 'general'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'school_settings'
});

module.exports = SchoolSetting;


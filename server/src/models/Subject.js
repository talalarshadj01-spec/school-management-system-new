const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100), // e.g., 'English', 'Mathematics', 'Urdu', 'Islamiat', 'Physics'
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('theory', 'practical', 'both'),
    defaultValue: 'theory'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'subjects'
});

module.exports = Subject;


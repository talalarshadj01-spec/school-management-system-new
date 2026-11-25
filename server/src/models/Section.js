const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(20), // 'A', 'B', 'Girls', 'Boys'
    allowNull: false
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roomNo: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  }
}, {
  tableName: 'sections',
  indexes: [
    {
      unique: true,
      fields: ['class_id', 'name']
    }
  ]
});

module.exports = Section;


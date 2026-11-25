const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Homework = sequelize.define('Homework', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sectionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  assignedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  attachmentUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'homeworks'
});

module.exports = Homework;


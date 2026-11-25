const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassSubject = sequelize.define('ClassSubject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'class_subjects',
  indexes: [
    {
      unique: true,
      fields: ['class_id', 'subject_id']
    }
  ]
});

module.exports = ClassSubject;


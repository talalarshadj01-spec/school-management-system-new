const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamSubject = sequelize.define('ExamSubject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  examinationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 100.00
  },
  passingMarks: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 33.00
  }
}, {
  tableName: 'exam_subjects',
  indexes: [
    {
      unique: true,
      fields: ['examination_id', 'class_id', 'subject_id']
    }
  ]
});

module.exports = ExamSubject;


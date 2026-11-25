const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HomeworkSubmission = sequelize.define('HomeworkSubmission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  homeworkId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  submissionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachmentUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'late', 'graded', 'resubmit'),
    defaultValue: 'submitted'
  },
  marksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'homework_submissions',
  indexes: [
    {
      unique: true,
      fields: ['homework_id', 'student_id']
    }
  ]
});

module.exports = HomeworkSubmission;


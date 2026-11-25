const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentMark = sequelize.define('StudentMark', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  examSubjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  marksObtained: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  isAbsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'student_marks',
  indexes: [
    {
      unique: true,
      fields: ['exam_subject_id', 'student_id']
    }
  ]
});

module.exports = StudentMark;


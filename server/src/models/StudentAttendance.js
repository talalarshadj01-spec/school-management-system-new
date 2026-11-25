const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentAttendance = sequelize.define('StudentAttendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sectionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'leave'),
    defaultValue: 'present'
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  markedById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'student_attendances',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'date']
    },
    {
      fields: ['class_id', 'section_id', 'date']
    }
  ]
});

module.exports = StudentAttendance;


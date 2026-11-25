const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherAttendance = sequelize.define('TeacherAttendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  teacherId: {
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
  checkIn: {
    type: DataTypes.TIME,
    allowNull: true
  },
  checkOut: {
    type: DataTypes.TIME,
    allowNull: true
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'teacher_attendances',
  indexes: [
    {
      unique: true,
      fields: ['teacher_id', 'date']
    }
  ]
});

module.exports = TeacherAttendance;


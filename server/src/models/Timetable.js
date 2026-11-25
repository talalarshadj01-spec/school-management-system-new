const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Timetable = sequelize.define('Timetable', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  academicSessionId: {
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
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    allowNull: false
  },
  periodNo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  roomNo: {
    type: DataTypes.STRING(30),
    allowNull: true
  }
}, {
  tableName: 'timetables',
  indexes: [
    {
      unique: true,
      fields: ['class_id', 'section_id', 'day_of_week', 'period_no']
    },
    {
      unique: true,
      fields: ['teacher_id', 'day_of_week', 'period_no']
    }
  ]
});

module.exports = Timetable;


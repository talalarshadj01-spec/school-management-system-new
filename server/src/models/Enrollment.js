const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  rollNo: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('enrolled', 'promoted', 'passed', 'left'),
    defaultValue: 'enrolled'
  }
}, {
  tableName: 'enrollments',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'academic_session_id']
    }
  ]
});

module.exports = Enrollment;


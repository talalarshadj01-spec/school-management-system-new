const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentTransport = sequelize.define('StudentTransport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stopId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled'),
    defaultValue: 'active'
  }
}, {
  tableName: 'student_transports',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'academic_session_id']
    }
  ]
});

module.exports = StudentTransport;


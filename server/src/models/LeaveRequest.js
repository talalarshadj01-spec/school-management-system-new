const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  applicantType: {
    type: DataTypes.ENUM('teacher', 'staff', 'student'),
    allowNull: false
  },
  applicantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leaveType: {
    type: DataTypes.ENUM('sick', 'casual', 'maternity', 'emergency', 'other'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewedById: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reviewRemarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'leave_requests'
});

module.exports = LeaveRequest;


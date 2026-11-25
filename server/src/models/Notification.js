const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('announcement', 'fee_reminder', 'attendance_alert', 'exam_result', 'general'),
    defaultValue: 'announcement'
  },
  targetRole: {
    type: DataTypes.STRING(50), // 'all', 'admin', 'teacher', 'parent', 'student'
    defaultValue: 'all'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'notifications'
});

module.exports = Notification;


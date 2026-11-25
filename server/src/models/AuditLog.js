const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  action: {
    type: DataTypes.STRING(100), // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', etc.
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING(100), // 'Student', 'FeePayment', 'Exam', etc.
    allowNull: false
  },
  entityId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  updatedAt: false // Logs are append-only
});

module.exports = AuditLog;


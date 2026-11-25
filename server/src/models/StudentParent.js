const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentParent = sequelize.define('StudentParent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  relationship: {
    type: DataTypes.STRING(50),
    defaultValue: 'parent'
  }
}, {
  tableName: 'student_parents',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'parent_id']
    }
  ]
});

module.exports = StudentParent;


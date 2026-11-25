const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Parent = sequelize.define('Parent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  fatherName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fatherCnic: {
    type: DataTypes.STRING(20), // Pakistani CNIC e.g., '35201-1234567-3'
    allowNull: true
  },
  fatherOccupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fatherPhone: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  fatherEmail: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  motherName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  motherCnic: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  motherOccupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  motherPhone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  guardianName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  guardianRelation: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  guardianPhone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'parents'
});

module.exports = Parent;


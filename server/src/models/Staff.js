const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  cnic: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(100), // e.g., 'Administration', 'Accounts', 'Library', 'Security'
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(100), // e.g., 'Accountant', 'Librarian', 'Security Guard'
    allowNull: false
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  basicSalary: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'on_leave', 'resigned', 'terminated'),
    defaultValue: 'active'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'staff'
});

module.exports = Staff;


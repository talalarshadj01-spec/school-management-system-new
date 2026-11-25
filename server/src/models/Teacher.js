const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Teacher = sequelize.define('Teacher', {
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
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  cnic: {
    type: DataTypes.STRING(20), // Pakistani CNIC e.g., '35201-1234567-1'
    allowNull: true,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  qualification: {
    type: DataTypes.STRING(150), // e.g., 'M.Sc. Mathematics, B.Ed.'
    allowNull: true
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100), // e.g., 'Science', 'Arts', 'Commerce'
    allowNull: true
  },
  designation: {
    type: DataTypes.STRING(100), // e.g., 'Senior Subject Teacher'
    allowNull: true
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
  },
  profilePhoto: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'teachers'
});

module.exports = Teacher;


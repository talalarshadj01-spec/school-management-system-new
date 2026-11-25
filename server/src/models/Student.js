const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  admissionNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  rollNo: {
    type: DataTypes.STRING(20),
    allowNull: true
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
    allowNull: false
  },
  bloodGroup: {
    type: DataTypes.STRING(10), // e.g., 'B+', 'O+'
    allowNull: true
  },
  bFormNo: {
    type: DataTypes.STRING(25), // Pakistani NADRA B-Form No.
    allowNull: true,
    unique: true
  },
  religion: {
    type: DataTypes.STRING(50),
    defaultValue: 'Islam'
  },
  nationality: {
    type: DataTypes.STRING(50),
    defaultValue: 'Pakistani'
  },
  admissionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  previousSchool: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  currentClassId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentSectionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currentSessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'alumni', 'transferred', 'suspended'),
    defaultValue: 'active'
  },
  profilePhoto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  emergencyContactName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  emergencyContactPhone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    defaultValue: 'Lahore'
  },
  state: {
    type: DataTypes.STRING(100),
    defaultValue: 'Punjab'
  }
}, {
  tableName: 'students',
  indexes: [
    { fields: ['admission_no'], unique: true },
    { fields: ['status'] },
    { fields: ['current_class_id'] },
    { fields: ['b_form_no'], unique: true, where: { b_form_no: { [require('sequelize').Op.ne]: null } } },
  ]
});

module.exports = Student;


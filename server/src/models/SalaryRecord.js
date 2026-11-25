const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SalaryRecord = sequelize.define('SalaryRecord', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  employeeType: {
    type: DataTypes.ENUM('teacher', 'staff'),
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  basicSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowances: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  netSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('paid', 'pending'),
    defaultValue: 'pending'
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque'),
    defaultValue: 'bank_transfer'
  },
  transactionReference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  paidById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'salary_records',
  indexes: [
    {
      fields: ['employee_type', 'teacher_id', 'staff_id', 'month', 'year']
    }
  ]
});

module.exports = SalaryRecord;


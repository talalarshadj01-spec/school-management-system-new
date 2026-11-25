const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeVoucher = sequelize.define('FeeVoucher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  voucherNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.INTEGER, // 1 to 12
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tuitionFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  otherFees: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  fineAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalPayable: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid', 'cancelled'),
    defaultValue: 'unpaid'
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'fee_vouchers',
  indexes: [
    {
      fields: ['student_id', 'academic_session_id', 'month', 'year']
    }
  ]
});

module.exports = FeeVoucher;


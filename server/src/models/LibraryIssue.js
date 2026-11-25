const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LibraryIssue = sequelize.define('LibraryIssue', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  borrowerType: {
    type: DataTypes.ENUM('student', 'teacher'),
    allowNull: false
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fineAmount: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('issued', 'returned', 'overdue', 'lost'),
    defaultValue: 'issued'
  },
  remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  issuedById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'library_issues'
});

module.exports = LibraryIssue;


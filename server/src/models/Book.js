const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  author: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rackNo: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  totalCopies: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  availableCopies: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  }
}, {
  tableName: 'books'
});

module.exports = Book;


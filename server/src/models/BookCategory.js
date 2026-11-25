const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookCategory = sequelize.define('BookCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'book_categories'
});

module.exports = BookCategory;


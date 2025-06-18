const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  name: DataTypes.STRING,
  birthday: DataTypes.DATEONLY,
  grade: DataTypes.STRING,
  class_type: DataTypes.ENUM('private', 'group'),
  parent_name: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  alt_number: DataTypes.STRING,
  notes: DataTypes.TEXT
}, {
  tableName: 'students',
  timestamps: false
});

module.exports = Student;

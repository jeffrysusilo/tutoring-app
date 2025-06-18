const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionStudent = sequelize.define('SessionStudent', {}, {
  tableName: 'session_students',
  timestamps: false
});

module.exports = SessionStudent;
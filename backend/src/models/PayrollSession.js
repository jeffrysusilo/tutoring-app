const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PayrollSession = sequelize.define('PayrollSession', {}, { timestamps: false });

module.exports = PayrollSession;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tutor = sequelize.define('Tutor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  alt_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  personal_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skck: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Tutor;

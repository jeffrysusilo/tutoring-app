const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TutorPayroll = sequelize.define('TutorPayroll', {
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  slip_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

module.exports = TutorPayroll;
// Pastikan untuk menambahkan relasi dengan model Tutor jika diperlukan
// TutorPayroll.belongsTo(Tutor, { foreignKey: 'tutorId' });    
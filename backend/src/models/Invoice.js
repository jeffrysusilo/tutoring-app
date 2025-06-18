const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');

const Invoice = sequelize.define('Invoice', {
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  sessions_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price_per_session: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

Invoice.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Invoice, { foreignKey: 'studentId' });

module.exports = Invoice;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');

const Invoice = sequelize.define('Invoice', {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_sessions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  credit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price_per_session: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

Invoice.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Invoice, { foreignKey: 'studentId' });

module.exports = Invoice;

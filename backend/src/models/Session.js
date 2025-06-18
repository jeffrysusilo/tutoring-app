const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Tutor = require('./Tutor');

const Session = sequelize.define('Session', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING, // contoh: '10.00', '13.00'
    allowNull: false,
  },
  class_type: {
    type: DataTypes.ENUM('private', 'group'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'missed', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'scheduled',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_recurring: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
},
});

// Relasi
Session.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Session, { foreignKey: 'studentId' });

Session.belongsTo(Tutor, { foreignKey: 'tutorId' });
Tutor.hasMany(Session, { foreignKey: 'tutorId' });

module.exports = Session;
    
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Tutor = require('./Tutor');
const SessionStudent = require('./SessionStudent');

const Session = sequelize.define('Session', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
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

// ✅ Relasi many-to-many (Session <-> Student)
Session.belongsToMany(Student, {
  through: SessionStudent,
  foreignKey: 'sessionId'
});

Student.belongsToMany(Session, {
  through: SessionStudent,
  foreignKey: 'studentId'
});

// ✅ Relasi one-to-many untuk Tutor (boleh tetap)
Session.belongsTo(Tutor, { foreignKey: 'tutorId' });
Tutor.hasMany(Session, { foreignKey: 'tutorId' });

module.exports = Session;

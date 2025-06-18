// const Tutor = require('../models/Tutor');
const { Op } = require('sequelize');
const { Tutor, Session, Student } = require('../models');
const SessionStudent = require('../models/SessionStudent');

exports.createTutor = async (req, res) => {
  try {
    const tutor = await Tutor.create(req.body);
    res.status(201).json(tutor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.findAll();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Tutor tidak ditemukan' });

    await tutor.update(req.body);
    res.json(tutor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Tutor tidak ditemukan' });

    await tutor.destroy();
    res.json({ message: 'Tutor berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /tutors/:id/report
exports.getTutorReport = async (req, res) => {
  const tutorId = req.params.id;

  try {
    const tutor = await Tutor.findByPk(tutorId);
    if (!tutor) return res.status(404).json({ error: 'Tutor tidak ditemukan' });

    const sessions = await Session.findAll({
      where: { tutorId },
      include: [
        {
          model: Student,
          attributes: ['id', 'name'],
          through: {
            attributes: ['status', 'notes']
          }
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    const report = sessions.map(session => ({
      id: session.id,
      date: session.date,
      time: session.time,
      class_type: session.class_type,
      students: session.Students.map(s => ({
        id: s.id,
        name: s.name,
        status: s.SessionStudent.status,
        notes: s.SessionStudent.notes
      }))
    }));

    res.json({
      tutor: {
        id: tutor.id,
        name: tutor.name
      },
      report
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil laporan sesi tutor' });
  }
};

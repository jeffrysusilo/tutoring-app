// const Student = require('../models/Student');
const { Student, Session, Tutor } = require('../models');
const SessionStudent = require('../models/SessionStudent');

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /students/:id/report
exports.getStudentReport = async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findByPk(studentId);
    if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan' });

    const sessions = await Session.findAll({
      include: [
        {
          model: Student,
          where: { id: studentId },
          attributes: [], // tidak perlu info siswa di dalam session
          through: {
            attributes: ['status', 'notes']
          }
        },
        {
          model: Tutor,
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    const report = sessions.map(session => ({
      id: session.id,
      date: session.date,
      time: session.time,
      class_type: session.class_type,
      tutor: session.Tutor?.name,
      status: session.Students[0]?.SessionStudent.status,
      notes: session.Students[0]?.SessionStudent.notes
    }));

    res.json({
      student: {
        id: student.id,
        name: student.name
      },
      report
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil laporan sesi siswa' });
  }
};


exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student tidak ditemukan' });

    await student.update(req.body);
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student tidak ditemukan' });

    await student.destroy();
    res.json({ message: 'Student berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

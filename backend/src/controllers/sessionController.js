const { Op } = require('sequelize');
const dayjs = require('dayjs');
const Session = require('../models/Session');
const SessionStudent = require('../models/SessionStudent');

// Waktu slot yang tersedia
const AVAILABLE_TIME_SLOTS = ['10.00', '13.00', '15.00', '18.00'];

// CREATE
// exports.createSession = async (req, res) => {
//   try {
//     const session = await Session.create(req.body);
//     res.status(201).json(session);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// READ
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: [
        {
          model: Student,
          through: {
            attributes: ['status', 'notes']
          }
        },
        {
          model: Tutor
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil sesi' });
  }
};


// UPDATE
// exports.updateSession = async (req, res) => {
//   try {
//     const session = await Session.findByPk(req.params.id);
//     if (!session) return res.status(404).json({ error: 'Session tidak ditemukan' });

//     await session.update(req.body);
//     res.json(session);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// DELETE
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session tidak ditemukan' });

    await session.destroy();
    res.json({ message: 'Session berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESCHEDULE
exports.rescheduleSession = async (req, res) => {
  try {
    const { date, time } = req.body;
    const session = await Session.findByPk(req.params.id);

    if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });

    session.date = date;
    session.time = time;
    session.status = 'rescheduled';
    session.tutorId = tutorId;
    await session.save();

    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// CEK SLOT KOSONG DI HARI TERTENTU
exports.getAvailableSlots = async (req, res) => {
  const { tutorId, studentId, date } = req.query;

  if (!tutorId || !studentId || !date) {
    return res.status(400).json({ error: 'tutorId, studentId, dan date wajib diisi' });
  }

  try {
    const sessions = await Session.findAll({
      where: {
        date,
        [Op.or]: [{ tutorId }, { studentId }]
      }
    });

    const takenSlots = sessions.map(s => s.time);
    const availableSlots = AVAILABLE_TIME_SLOTS.filter(slot => !takenSlots.includes(slot));

    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CEK SUGGESTED SLOT BEBERAPA HARI KE DEPAN
exports.getAvailableSlotSuggestions = async (req, res) => {
  const { tutorId, studentId, days = 7 } = req.query;

  if (!tutorId || !studentId) {
    return res.status(400).json({ error: 'tutorId dan studentId wajib diisi' });
  }

  const suggestions = [];

  try {
    for (let i = 0; i < parseInt(days); i++) {
      const date = dayjs().add(i, 'day').format('YYYY-MM-DD');

      const sessions = await Session.findAll({
        where: {
          date,
          [Op.or]: [{ tutorId }, { studentId }]
        }
      });

      const taken = sessions.map(s => s.time);
      const available = AVAILABLE_TIME_SLOTS.filter(slot => !taken.includes(slot));

      if (available.length > 0) {
        suggestions.push({ date, slots: available });
      }
    }

    if (suggestions.length === 0) {
      return res.status(404).json({ message: 'Tidak ada slot kosong selama ' + days + ' hari ke depan' });
    }

    res.json({ suggestions });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RECURRING SESSION
const daysMap = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6
};

// POST /sessions/recurring
exports.createRecurringSessions = async (req, res) => {
  const { studentIds, tutorId, daysOfWeek, time, startDate, endDate, class_type: classType } = req.body;
  const createdSessions = [];

  try {
    const dayjs = require('dayjs');
    const daysMap = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6
    };

    const targetDays = daysOfWeek.map(d => daysMap[d]);
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const day = current.day(); // 0-6
      if (targetDays.includes(day)) {
        const dateStr = current.format('YYYY-MM-DD');

        // Cek konflik per siswa dan tutor
        const conflict = await Session.findOne({
          where: {
            date: dateStr,
            time,
            tutorId
          },
          include: [
            {
              model: Student,
              where: {
                id: {
                  [Op.in]: studentIds
                }
              }
            }
          ]
        });

        if (!conflict) {
          const session = await Session.create({
            tutorId,
            class_type: classType,
            date: dateStr,
            time,
            is_recurring: true
          });

          // Tambahkan semua siswa ke session
          await session.addStudents(studentIds);
          createdSessions.push(session);
        }
      }

      current = current.add(1, 'day');
    }

    res.json({
      message: `${createdSessions.length} sesi berhasil dibuat`,
      sessions: createdSessions.map(s => ({
        date: s.date,
        time: s.time
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat sesi berulang' });
  }
};

// DELETE /sessions/recurring
exports.deleteRecurringSessions = async (req, res) => {
  const { studentId, tutorId, startDate, endDate } = req.body;

  try {
    const where = {
      is_recurring: true,
      tutorId,
      date: {
        [Op.between]: [startDate, endDate]
      }
    };

    const sessions = await Session.findAll({
      where,
      include: studentId ? [{
        model: Student,
        where: { id: studentId }
      }] : [Student]
    });

    let deletedCount = 0;

    for (const session of sessions) {
      if (studentId) {
        await session.removeStudent(studentId);
        const remaining = await session.getStudents();
        if (remaining.length === 0) {
          await session.destroy();
          deletedCount++;
        }
      } else {
        await session.setStudents([]); // kosongkan semua siswa
        await session.destroy();       // hapus session
        deletedCount++;
      }
    }

    res.json({ message: `${deletedCount} sesi berulang berhasil dihapus` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus sesi berulang' });
  }
};

// PATCH /sessions/:id/report
exports.reportSession = async (req, res) => {
  const { students } = req.body; // [{ studentId, status, notes }, ...]

  try {
    const session = await Session.findByPk(req.params.id, {
      include: [Student, Tutor]
    });

    if (!session) return res.status(404).json({ error: 'Session tidak ditemukan' });

    for (const { studentId, status, notes } of students) {
      await SessionStudent.update(
        { status, notes },
        {
          where: {
            sessionId: session.id,
            studentId
          }
        }
      );
    }

    res.json({ message: 'Laporan sesi berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui laporan sesi' });
  }
};



const { Op } = require('sequelize');
const dayjs = require('dayjs');
const Session = require('../models/Session');

// Waktu slot yang tersedia
const AVAILABLE_TIME_SLOTS = ['10.00', '13.00', '15.00', '18.00'];

// CREATE
exports.createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: ['Student', 'Tutor']
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

exports.createRecurringSessions = async (req, res) => {
  const { studentId, tutorId, daysOfWeek, time, startDate, endDate, class_type } = req.body;
  const createdSessions = [];

  try {
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    const targetDays = daysOfWeek.map(d => daysMap[d]);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const day = current.day();
      if (targetDays.includes(day)) {
        const conflict = await Session.findOne({
          where: {
            date: current.format('YYYY-MM-DD'),
            time,
            [Op.or]: [{ studentId }, { tutorId }]
          }
        });

        if (!conflict) {
          const session = await Session.create({
            studentId,
            tutorId,
            class_type,
            date: current.format('YYYY-MM-DD'),
            time,
            is_recurring: true
          });
          createdSessions.push(session);
        }
      }
      current = current.add(1, 'day');
    }

    res.json({
      message: `${createdSessions.length} sesi berhasil dibuat`,
      sessions: createdSessions.map(s => ({ date: s.date, time: s.time }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat sesi berulang' });
  }
};

// DELETE RECURRING
exports.deleteRecurringSessions = async (req, res) => {
  const { studentId, tutorId, startDate, endDate } = req.body;

  try {
    const deleted = await Session.destroy({
      where: {
        studentId,
        tutorId,
        is_recurring: true,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    res.json({ message: `${deleted} sesi berulang berhasil dihapus` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus sesi berulang' });
  }
};

const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const Session = require('../models/Session');
const { Op } = require('sequelize');

const daysMap = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6
};

// POST /sessions/recurring
router.post('/recurring', async (req, res) => {
  const { studentId, tutorId, daysOfWeek, time, startDate, endDate, class_type: classType } = req.body;
  const createdSessions = [];

  try {
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    const targetDays = daysOfWeek.map(d => daysMap[d]);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const day = current.day(); // 0 - 6
      if (targetDays.includes(day)) {
        const conflict = await Session.findOne({
          where: {
            date: current.format('YYYY-MM-DD'),
            time,
            [Op.or]: [
              { studentId },
              { tutorId }
            ]
          }
        });

        if (!conflict) {
          const session = await Session.create({
            studentId: studentId,
            tutorId: tutorId,
            class_type: classType,
            date: current.format('YYYY-MM-DD'),
            time,
            is_recurring: true 
          });

          createdSessions.push(session); // ← ✅ Tambahkan ini
        }
      }

      current = current.add(1, 'day'); // ← ✅ Harus di luar if
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
});

// DELETE /sessions/recurring
router.delete('/recurring', async (req, res) => {
  const { studentId, tutorId, startDate, endDate } = req.body;

  try {
    const deleted = await Session.destroy({
      where: {
        studentId,
        tutorId,
        is_recurring: true || false,
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
});

module.exports = router;

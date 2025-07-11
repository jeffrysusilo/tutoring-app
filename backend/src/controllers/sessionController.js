const { Op } = require('sequelize');
const dayjs = require('dayjs');
const Session = require('../models/Session');
const SessionStudent = require('../models/SessionStudent');
const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
// const Session = require('../models/Session');
// const Invoice = require('../models/Invoice');
// const Student = require('../models/Student');

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
// PUT reschedule session
exports.rescheduleSession = async (req, res) => {
  try {
    const { date, time } = req.body;
    const session = await Session.findByPk(req.params.id);

    if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });

    if (session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Hanya sesi yang berstatus scheduled yang dapat di-reschedule' });
    }

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

// POST /sessions/recurring
exports.createRecurringSessions = async (req, res) => {
  const { studentId, tutorId, daysOfWeek, time, startDate, class_type: classType } = req.body;
  const createdSessions = [];

  try {
    // Ambil total credit dari invoice terakhir yang belum habis
    const invoice = await Invoice.findOne({
      where: {
        studentId,
        paid: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!invoice) {
      return res.status(400).json({ error: 'Student belum memiliki invoice aktif' });
    }

    // Hitung jumlah sesi yang sudah digunakan
    const usedCount = await Session.count({
      where: {
        studentId,
        is_recurring: true,
        status: {
          [Op.in]: ['scheduled', 'completed', 'missed']
        }
      }
    });

    const remainingQuota = invoice.credit - usedCount;

    if (remainingQuota <= 0) {
      return res.status(400).json({ error: 'Kuota sesi sudah habis, silakan extend invoice' });
    }

    let current = dayjs(startDate);
    const targetDays = daysOfWeek.map(d => daysMap[d]);

    while (createdSessions.length < remainingQuota) {
      const day = current.day();
      if (targetDays.includes(day)) {
        // Cek bentrok
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
            date: current.format('YYYY-MM-DD'),
            time,
            class_type: classType,
            is_recurring: true
          });

          createdSessions.push(session);
        }
      }
      current = current.add(1, 'day');
    }

    res.json({
      message: `${createdSessions.length} sesi berhasil dibuat berdasarkan kuota`,
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


exports.updateSessionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const session = await Session.findByPk(req.params.id, {
      include: ['Students']
    });

    if (!session) {
      return res.status(404).json({ error: 'Session tidak ditemukan' });
    }

    const oldStatus = session.status;

    // Update status dan notes
    await session.update({ status, notes });

    const shouldDeduct =
      ['completed', 'missed'].includes(status) &&
      !['completed', 'missed'].includes(oldStatus);

    if (shouldDeduct) {
      for (const student of session.Students) {
        const invoice = await Invoice.findOne({
          where: {
            studentId: student.id,
            paid: true
          },
          order: [['createdAt', 'DESC']]
        });

        if (invoice && invoice.credit > 0) {
          invoice.credit -= 1;
          await invoice.save();
        }
      }
    }

    res.json({ message: 'Status sesi diperbarui', session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui status sesi' });
  }
};




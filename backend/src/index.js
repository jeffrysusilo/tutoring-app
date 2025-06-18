require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const sequelize = require('./config/database');

const Student = require('./models/Student');

const Tutor = require('./models/Tutor');

const Session = require('./models/Session');

const { Op } = require('sequelize'); 

const dayjs = require('dayjs');

app.use(express.json());

const sessionRoutes = require('./routes/sessions');
app.use('/sessions', sessionRoutes);


app.get('/', (req, res) => {
  res.send('API berjalan 🚀');
});

// Cek koneksi DB
sequelize.authenticate()
  .then(() => console.log('🟢 Koneksi database berhasil'))
  .catch((err) => console.error('🔴 Gagal koneksi database:', err));

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

sequelize.sync().then(() => {
  console.log('📦 Model sinkron dengan database');
});

// Tambah student
app.post('/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lihat semua student
app.get('/students', async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambah tutor
app.post('/tutors', async (req, res) => {
  try {
    const tutor = await Tutor.create(req.body);
    res.status(201).json(tutor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lihat semua tutor
app.get('/tutors', async (req, res) => {
  try {
    const tutors = await Tutor.findAll();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambah sesi
app.post('/sessions', async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lihat semua sesi
app.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: ['Student', 'Tutor']
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student tidak ditemukan' });

    await student.update(req.body);
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student tidak ditemukan' });

    await student.destroy();
    res.json({ message: 'Student berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tutors/:id', async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Tutor tidak ditemukan' });

    await tutor.update(req.body);
    res.json(tutor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/tutors/:id', async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Tutor tidak ditemukan' });

    await tutor.destroy();
    res.json({ message: 'Tutor berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/sessions/:id/reschedule', async (req, res) => {
  try {
    const { date, time } = req.body;
    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Sesi tidak ditemukan' });
    }

    session.date = date;
    session.time = time;
    session.status = 'rescheduled';

    await session.save();

    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session tidak ditemukan' });

    await session.update(req.body);
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session tidak ditemukan' });

    await session.destroy();
    res.json({ message: 'Session berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sessions/available-slots', async (req, res) => {
  const { tutorId, studentId, date } = req.query;

  if (!tutorId || !studentId || !date) {
    return res.status(400).json({ error: 'tutorId, studentId, dan date wajib diisi' });
  }

  const AVAILABLE_TIME_SLOTS = ['10.00', '13.00', '15.00', '18.00'];

  try {
    const sessions = await Session.findAll({
      where: {
        date,
        [Op.or]: [
          { tutorId },
          { studentId }
        ]
      }
    });

    const takenSlots = sessions.map(s => s.time);
    const availableSlots = AVAILABLE_TIME_SLOTS.filter(slot => !takenSlots.includes(slot));

    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sessions/available-slots/suggestions', async (req, res) => {
  const { tutorId, studentId, days = 7 } = req.query;

  if (!tutorId || !studentId) {
    return res.status(400).json({ error: 'tutorId dan studentId wajib diisi' });
  }

  const AVAILABLE_TIME_SLOTS = ['10.00', '13.00', '15.00', '18.00'];
  const suggestions = [];

  try {
    for (let i = 0; i < parseInt(days); i++) {
      const date = dayjs().add(i, 'day').format('YYYY-MM-DD');

      const sessions = await Session.findAll({
        where: {
          date,
          [Op.or]: [
            { tutorId },
            { studentId }
          ]
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
});



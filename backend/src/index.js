require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const sequelize = require('./config/database');

const Student = require('./models/Student');

const Tutor = require('./models/Tutor');

const Session = require('./models/Session');


app.use(express.json());

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

// Reschedule sesi
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


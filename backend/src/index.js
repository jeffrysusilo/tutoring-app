require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const sequelize = require('./config/database');

// Middleware
app.use(express.json());

// Routes
const sessionRoutes = require('./routes/sessions');
const studentRoutes = require('./routes/students');
const tutorRoutes = require('./routes/tutors');
const invoiceRoutes = require('./routes/invoices');
const creditRoutes = require('./routes/credits');

app.use('/sessions', sessionRoutes);
app.use('/students', studentRoutes);
app.use('/tutors', tutorRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/credits', creditRoutes);

app.get('/', (req, res) => {
  res.send('API berjalan 🚀');
});

// Database connection & sync
sequelize.authenticate()
  .then(() => console.log('🟢 Koneksi database berhasil'))
  .catch(err => console.error('🔴 Gagal koneksi database:', err));

sequelize.sync()
  .then(() => console.log('📦 Model sinkron dengan database'));

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

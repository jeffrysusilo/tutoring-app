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
const tutorPayrollRoutes = require('./routes/tutorPayroll');
const cashflowRoutes = require('./routes/cashflow');
const cors = require('cors');

// app.use(cors({
//   origin: process.env.CORS_ORIGIN || '*', // Ganti dengan URL frontend jika ada
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors());
app.use('/sessions', sessionRoutes);
app.use('/students', studentRoutes);
app.use('/tutors', tutorRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/credits', creditRoutes);
app.use('/tutor-payrolls', tutorPayrollRoutes);
app.use('/cashflow', cashflowRoutes);

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

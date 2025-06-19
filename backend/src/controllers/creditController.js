const Invoice = require('../models/Invoice');
const Session = require('../models/Session');
const { Op } = require('sequelize');

exports.getStudentCredit = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Hitung total credit dari invoice yang sudah dibayar
    const paidInvoices = await Invoice.findAll({
      where: {
        studentId,
        paid: true
      }
    });

    const totalCredit = paidInvoices.reduce((sum, invoice) => sum + invoice.credit, 0);

    // Hitung jumlah sesi completed/missed (sudah digunakan)
    const usedSessions = await Session.count({
      where: {
        studentId,
        status: {
          [Op.in]: ['completed', 'missed']
        }
      }
    });

    const remainingCredit = totalCredit - usedSessions;

    res.json({
      studentId,
      totalCredit,
      usedSessions,
      remainingCredit
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil sisa credit student' });
  }
};

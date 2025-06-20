const Invoice = require('../models/Invoice');
const TutorPayroll = require('../models/TutorPayroll');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const dayjs = require('dayjs');

exports.getCashflowHistory = async (req, res) => {
  const { month, year } = req.query;

  try {
    const invoiceWhere = { paid: true };
    const payrollWhere = { paid: true };

    // Jika ada filter bulan dan tahun
    if (month && year) {
      const start = dayjs(`${year}-${month}-01`).startOf('month').toDate();
      const end = dayjs(start).endOf('month').toDate();

      invoiceWhere.paid_at = { [Op.between]: [start, end] };
      payrollWhere.paid_at = { [Op.between]: [start, end] };
    }

    const invoices = await Invoice.findAll({
      where: invoiceWhere,
      include: [{ model: Student }],
    });

    const payrolls = await TutorPayroll.findAll({
      where: payrollWhere,
      include: [{ model: Tutor }],
    });

    const income = invoices.map(inv => ({
      type: 'income',
      source: 'Student Invoice',
      amount: inv.total_amount,
      date: inv.paid_at,
      description: `Invoice for ${inv.Student?.name || 'Student #' + inv.studentId}`
    }));

    const expenses = payrolls.map(p => ({
      type: 'expense',
      source: 'Tutor Payroll',
      amount: p.total_amount,
      date: p.paid_at,
      description: `Payroll for ${p.Tutor?.name || 'Tutor #' + p.tutorId}`
    }));

    const all = [...income, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

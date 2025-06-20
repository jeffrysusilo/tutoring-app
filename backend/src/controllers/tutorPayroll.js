const TutorPayroll = require('../models/TutorPayroll');
const Session = require('../models/Session');
const { Op } = require('sequelize');

// GET all payrolls
exports.getAllPayrolls = async (req, res) => {
  const payrolls = await TutorPayroll.findAll({ include: [Session] });
  res.json(payrolls);
};

// POST create payroll
exports.createPayroll = async (req, res) => {
  const { tutorId, due_date, sessionIds, total_amount, notes } = req.body;

  try {
    const sessions = await Session.findAll({
      where: {
        id: sessionIds,
        tutorId,
        status: 'completed'
      }
    });

    if (sessions.length === 0) {
      return res.status(400).json({ error: 'Tidak ada sesi completed yang valid untuk payroll.' });
    }

    // Validasi jumlah sesuai input
    if (sessions.length !== sessionIds.length) {
      return res.status(400).json({
        error: 'Beberapa sesi tidak valid atau tidak berstatus completed.',
        validSessionIds: sessions.map(s => s.id)
      });
    }

    const payroll = await TutorPayroll.create({
      due_date,
      total_amount,
      notes
    });

    await payroll.addSessions(sessions);

    res.status(201).json({ message: 'Payroll created', payroll });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// PATCH mark as paid
exports.markPayrollPaid = async (req, res) => {
  try {
    const payroll = await TutorPayroll.findByPk(req.params.id);
    if (!payroll) return res.status(404).json({ error: 'Payroll not found' });

    await payroll.update({
      paid: true,
      paid_at: new Date(),
      slip_url: req.body.slip_url || null
    });

    res.json({ message: 'Payroll marked as paid', payroll });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.filterPayrolls = async (req, res) => {
  const { tutorId, month, year } = req.query;

  if (!tutorId || !month || !year) {
    return res.status(400).json({ error: 'tutorId, month, dan year wajib diisi' });
  }

  const start = `${year}-${month.padStart(2, '0')}-01`;
  const end = dayjs(start).endOf('month').format('YYYY-MM-DD');

  try {
    const sessions = await Session.findAll({
      where: {
        tutorId,
        status: 'completed',
        date: {
          [Op.between]: [start, end]
        }
      }
    });

    res.json({
      count: sessions.length,
      total_estimated: sessions.length * 150000, // ← Sesuaikan rate jika fleksibel
      sessions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


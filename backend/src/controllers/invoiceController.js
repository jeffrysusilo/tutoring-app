const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
  try {
    const { studentId, total_sessions, price_per_session, discount = 0, notes } = req.body;
    const credit = total_sessions;

    const invoice = await Invoice.create({
      studentId,
      total_sessions,
      credit,
      price_per_session,
      discount,
      notes
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getInvoicesByStudent = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { studentId: req.params.studentId },
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan' });

    invoice.paid = true;
    invoice.paid_at = new Date();
    await invoice.save();

    res.json({ message: 'Invoice ditandai sebagai lunas', invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

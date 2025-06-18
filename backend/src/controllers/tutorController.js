const Tutor = require('../models/Tutor');

exports.createTutor = async (req, res) => {
  try {
    const tutor = await Tutor.create(req.body);
    res.status(201).json(tutor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.findAll();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Tutor tidak ditemukan' });

    await tutor.update(req.body);
    res.json(tutor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByPk(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Tutor tidak ditemukan' });

    await tutor.destroy();
    res.json({ message: 'Tutor berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

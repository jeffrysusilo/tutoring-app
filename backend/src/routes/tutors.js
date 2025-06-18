const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

router.post('/', tutorController.createTutor);
router.get('/', tutorController.getAllTutors);
router.put('/:id', tutorController.updateTutor);
router.delete('/:id', tutorController.deleteTutor);
// GET /tutors/:id/report
router.get('/:id/report', tutorController.getTutorReport);

module.exports = router;

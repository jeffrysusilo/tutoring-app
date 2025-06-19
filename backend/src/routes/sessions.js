const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// CRUD
// router.post('/', sessionController.createSession);
router.get('/', sessionController.getAllSessions);
// router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);

// Reschedule
router.put('/:id/reschedule', sessionController.rescheduleSession);

// Slot availability
router.get('/available-slots', sessionController.getAvailableSlots);
router.get('/available-slots/suggestions', sessionController.getAvailableSlotSuggestions);

// Recurring
router.post('/recurring', sessionController.createRecurringSessions);
router.delete('/recurring', sessionController.deleteRecurringSessions);

// Report
router.put('/:id/laporan', sessionController.updateLaporanSession);

router.put('/:id/status', updateSessionStatus);

module.exports = router;

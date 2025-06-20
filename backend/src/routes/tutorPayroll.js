const express = require('express');
const router = express.Router();
const controller = require('../controllers/tutorPayroll');

router.get('/', controller.getAllPayrolls);
router.post('/', controller.createPayroll);
router.patch('/:id/pay', controller.markPayrollPaid);
router.get('/filter', controller.filterPayrolls); // ← Tambahan


module.exports = router;
    // This code defines the routes for managing tutor payrolls in an Express application.  
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/', invoiceController.createInvoice);

router.get('/student/:studentId', invoiceController.getInvoicesByStudent);

router.put('/:id/pay', invoiceController.markAsPaid);

module.exports = router;

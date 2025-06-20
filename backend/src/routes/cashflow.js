const express = require('express');
const router = express.Router();
const controller = require('../controllers/cashflowController');

router.get('/', controller.getCashflowHistory);

module.exports = router;

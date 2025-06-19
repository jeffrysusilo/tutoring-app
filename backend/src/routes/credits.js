const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');

router.get('/student/:studentId', creditController.getStudentCredit);

module.exports = router;
const express = require('express');
const { getAllSalaryRecords, markSalaryAsPaid, getMonthlyReport } = require('../controllers/salaryController');
const checkPermission = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', checkPermission('casual_staff_salary', 'read'), getAllSalaryRecords);
router.put('/:id/pay', checkPermission('casual_staff_salary', 'update'), markSalaryAsPaid);
router.get('/report', checkPermission('casual_staff_salary', 'read'), getMonthlyReport);

module.exports = router;

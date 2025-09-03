const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Step-by-step endpoints 
router.get('/casual-salary/total', reportController.getTotalCasualSalary);
router.get('/petty-cash/total', reportController.getTotalPettyCash);
router.get('/fruit-deliveries/summary', reportController.getFruitProcurementSummary);
router.get('/oil-production/summary', reportController.getOilProductionSummary);
router.get('/monthly-summary', reportController.getMonthlySummary);
router.get('/expenses/trend', reportController.getExpenseTrend);
router.get('/fruits/by-type', reportController.getFruitTypeBreakdown);
router.get('/oil/yield-trend', reportController.getOilYieldTrend);
router.get('/export/petty-cash', reportController.exportPettyCashToExcel);
router.get('/export/casual-staff', reportController.exportCasualStaffToExcel);
router.get('/export/fruit-deliveries', reportController.exportFruitDeliveriesToExcel);
router.get('/export/oil-production', reportController.exportOilProductionToExcel);
router.get('/export/fruit-deliveries', reportController.exportFruitDeliveriesToExcel);
router.get('/export/petty-cash', reportController.exportPettyCashToExcel);
router.get('/export/misc-expenses', reportController.exportMiscExpensesToExcel);
router.get('/export/summary/pdf', reportController.exportMonthlySummaryToPDF);



module.exports = router;

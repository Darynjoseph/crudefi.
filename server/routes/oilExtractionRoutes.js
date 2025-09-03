const express = require('express');
const router = express.Router();
const oil = require('../controllers/oilExtractionController_normalized');
const checkPermission = require('../middleware/roleMiddleware');

// READ all logs
router.get('/', checkPermission('oil_extraction_logs', 'read'), oil.getAll);

// Get oil extraction statistics (MUST be before /:id route)
router.get('/stats', checkPermission('oil_extraction_logs', 'read'), oil.getStats);

// READ one log
router.get('/:id', checkPermission('oil_extraction_logs', 'read'), oil.getOne);

// CREATE a new log
router.post('/', checkPermission('oil_extraction_logs', 'create'), oil.create);

// UPDATE a log
router.put('/:id', checkPermission('oil_extraction_logs', 'update'), oil.update);

// DELETE a log
router.delete('/:id', checkPermission('oil_extraction_logs', 'delete'), oil.delete);

module.exports = router;

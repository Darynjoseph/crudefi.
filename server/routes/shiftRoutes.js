const express = require('express');
const router = express.Router();
const { getShifts, getShiftStats, openShift, closeShift } = require('../controllers/shiftController');
const { requirePermission } = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authenticateToken');

// Get shift statistics
router.get('/stats', authenticateToken, requirePermission('shifts', 'read'), getShiftStats);

// Get all shifts with filtering
router.get('/', authenticateToken, requirePermission('shifts', 'read'), getShifts);

// Open shift
router.post('/open', authenticateToken, requirePermission('shifts', 'create'), openShift);

// Close shift
router.put('/close/:shift_id', authenticateToken, requirePermission('shifts', 'update'), closeShift);

module.exports = router;

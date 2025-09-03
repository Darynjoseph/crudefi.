const express = require('express');
const { 
  addStaff, 
  getAllStaff, 
  getStaffById,
  updateStaff, 
  deleteStaff,
  canDeleteStaff,
  getStaffStats
} = require('../controllers/staffController');
const { requirePermission } = require('../middleware/authMiddleware');
const router = express.Router();

// Staff CRUD routes (authentication is handled by requirePermission middleware)
router.get('/', requirePermission('staff', 'read'), getAllStaff);
router.get('/stats', requirePermission('staff', 'read'), getStaffStats);
router.get('/:id', requirePermission('staff', 'read'), getStaffById);
router.get('/:id/can-delete', requirePermission('staff', 'delete'), canDeleteStaff);
router.post('/', requirePermission('staff', 'create'), addStaff);
router.put('/:id', requirePermission('staff', 'update'), updateStaff);
router.delete('/:id', requirePermission('staff', 'delete'), deleteStaff);

module.exports = router;

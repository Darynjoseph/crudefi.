const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authenticateToken');
const expenseType = require('../controllers/expenseTypeController');

// Statistics endpoint
router.get('/stats', authenticateToken, requirePermission('expense_types', 'read'), expenseType.getStats);

// CRUD endpoints
router.get('/', authenticateToken, requirePermission('expense_types', 'read'), expenseType.getAll);
router.get('/:id', authenticateToken, requirePermission('expense_types', 'read'), expenseType.getOne);
router.post('/', authenticateToken, requirePermission('expense_types', 'create'), expenseType.create);
router.put('/:id', authenticateToken, requirePermission('expense_types', 'update'), expenseType.update);
router.delete('/:id', authenticateToken, requirePermission('expense_types', 'delete'), expenseType.remove);

module.exports = router;
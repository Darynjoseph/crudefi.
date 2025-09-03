const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authenticateToken');
const expense = require('../controllers/expenseController');

// Statistics endpoint
router.get('/stats', authenticateToken, requirePermission('expenses', 'read'), expense.getStats);

// CRUD endpoints
router.get('/', authenticateToken, requirePermission('expenses', 'read'), expense.getAll);
router.get('/:id', authenticateToken, requirePermission('expenses', 'read'), expense.getOne);
router.post('/', authenticateToken, requirePermission('expenses', 'create'), expense.create);
router.put('/:id', authenticateToken, requirePermission('expenses', 'update'), expense.update);
router.delete('/:id', authenticateToken, requirePermission('expenses', 'delete'), expense.remove);

module.exports = router;
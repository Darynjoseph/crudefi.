const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authenticateToken');
const category = require('../controllers/categoryController');

// CRUD endpoints for expense categories
router.get('/', authenticateToken, requirePermission('expense_categories', 'read'), category.getCategories);
router.post('/', authenticateToken, requirePermission('expense_categories', 'create'), category.addCategory);
router.put('/:id', authenticateToken, requirePermission('expense_categories', 'update'), category.updateCategory);
router.delete('/:id', authenticateToken, requirePermission('expense_categories', 'delete'), category.deleteCategory);

module.exports = router;
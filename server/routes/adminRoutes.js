const express = require('express');
const router = express.Router();
const approverController = require('../controllers/approverController');
const categoryController = require('../controllers/categoryController');
const checkPermission = require('../middleware/roleMiddleware'); // Add this

// Approvers routes
router.get('/approvers', checkPermission('approvers', 'read'), approverController.getApprovers);
router.post('/approvers', checkPermission('approvers', 'create'), approverController.addApprover);
router.put('/approvers/:id', checkPermission('approvers', 'update'), approverController.updateApprover);
router.delete('/approvers/:id', checkPermission('approvers', 'delete'), approverController.deleteApprover);

// Categories
router.get('/categories', checkPermission('expense_categories', 'read'), categoryController.getCategories);
router.post('/categories', checkPermission('expense_categories', 'create'), categoryController.addCategory);
router.put('/categories/:id', checkPermission('expense_categories', 'update'), categoryController.updateCategory);
router.delete('/categories/:id', checkPermission('expense_categories', 'delete'), categoryController.deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/authMiddleware');
const supplier = require('../controllers/supplierController');

// Follow the same pattern as staffRoutes.js
router.get('/', requirePermission('suppliers', 'read'), supplier.getAll);
router.get('/stats', requirePermission('suppliers', 'read'), supplier.getStats);
router.get('/:id', requirePermission('suppliers', 'read'), supplier.getOne);
router.post('/', requirePermission('suppliers', 'create'), supplier.create);
router.put('/:id', requirePermission('suppliers', 'update'), supplier.update);
router.delete('/:id', requirePermission('suppliers', 'delete'), supplier.delete);

module.exports = router;

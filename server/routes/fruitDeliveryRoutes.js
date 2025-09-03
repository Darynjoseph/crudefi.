const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authenticateToken');
const fruit = require('../controllers/fruitDeliveryController_normalized');

// Statistics endpoint
router.get('/stats', authenticateToken, requirePermission('fruit_deliveries', 'read'), fruit.getStats);

// CRUD endpoints
router.get('/', authenticateToken, requirePermission('fruit_deliveries', 'read'), fruit.getAll);
router.get('/:id', authenticateToken, requirePermission('fruit_deliveries', 'read'), fruit.getOne);
router.post('/', authenticateToken, requirePermission('fruit_deliveries', 'create'), fruit.create);
router.put('/:id', authenticateToken, requirePermission('fruit_deliveries', 'update'), fruit.update);
router.delete('/:id', authenticateToken, requirePermission('fruit_deliveries', 'delete'), fruit.delete);

module.exports = router;

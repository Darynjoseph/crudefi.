const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/authMiddleware');
const fruit = require('../controllers/fruitController');

// Follow the same pattern as staffRoutes.js
router.get('/', requirePermission('fruits', 'read'), fruit.getAll);
router.get('/stats', requirePermission('fruits', 'read'), fruit.getStats);
router.get('/:id', requirePermission('fruits', 'read'), fruit.getOne);
router.post('/', requirePermission('fruits', 'create'), fruit.create);
router.put('/:id', requirePermission('fruits', 'update'), fruit.update);
router.delete('/:id', requirePermission('fruits', 'delete'), fruit.delete);

module.exports = router;

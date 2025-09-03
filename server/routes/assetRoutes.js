const express = require('express');
const router = express.Router();
const { requirePermission } = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authenticateToken');
const asset = require('../controllers/assetController');

// Statistics endpoint
router.get('/stats', authenticateToken, requirePermission('assets', 'read'), asset.getStats);

// Calculate depreciation for an asset
router.get('/:id/depreciation', authenticateToken, requirePermission('assets', 'read'), asset.calculateDepreciation);

// CRUD endpoints
router.get('/', authenticateToken, requirePermission('assets', 'read'), asset.getAll);
router.get('/:id', authenticateToken, requirePermission('assets', 'read'), asset.getOne);
router.post('/', authenticateToken, requirePermission('assets', 'create'), asset.create);
router.put('/:id', authenticateToken, requirePermission('assets', 'update'), asset.update);
router.delete('/:id', authenticateToken, requirePermission('assets', 'delete'), asset.remove);

module.exports = router;
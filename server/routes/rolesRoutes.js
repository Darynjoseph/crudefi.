const express = require('express');
const router = express.Router();
const controller = require('../controllers/rolesController');
const checkPermission = require('../middleware/roleMiddleware');

// Permissions applied per route:
router.get('/', checkPermission('roles', 'read'), controller.getAll);
router.get('/:role_name', checkPermission('roles', 'read'), controller.getOne);
router.post('/', checkPermission('roles', 'create'), controller.create);
router.put('/:role_name', checkPermission('roles', 'update'), controller.update);
router.delete('/:role_name', checkPermission('roles', 'delete'), controller.remove);

module.exports = router;

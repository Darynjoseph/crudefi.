const express = require('express');
const router = express.Router();
const controller = require('../controllers/miscExpenseController');
const checkPermission = require('../middleware/roleMiddleware'); // import middleware

// Permissions applied per route:
router.get('/', checkPermission('misc_expenses', 'read'), controller.getAll);
router.get('/:id', checkPermission('misc_expenses', 'read'), controller.getOne);
router.post('/', checkPermission('misc_expenses', 'create'), controller.create);
router.put('/:id', checkPermission('misc_expenses', 'update'), controller.update);
router.delete('/:id', checkPermission('misc_expenses', 'delete'), controller.remove);

module.exports = router;

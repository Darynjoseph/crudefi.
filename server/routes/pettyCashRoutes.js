const express = require('express');
const router = express.Router();
const pc = require('../controllers/pettyCashController');
const checkPermission = require('../middleware/roleMiddleware');

// READ all petty cash entries
router.get('/', checkPermission('petty_cash', 'read'), pc.getAll);

// READ one petty cash entry by ID
router.get('/:id', checkPermission('petty_cash', 'read'), pc.getOne);

// CREATE a new petty cash entry
router.post('/', checkPermission('petty_cash', 'create'), pc.create);

// UPDATE a petty cash entry
router.put('/:id', checkPermission('petty_cash', 'update'), pc.update);

// DELETE a petty cash entry
router.delete('/:id', checkPermission('petty_cash', 'delete'), pc.remove);

module.exports = router;

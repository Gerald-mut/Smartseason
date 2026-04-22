const express = require('express');
const router = express.Router();
const { authenticate, authorise } = require('../middleware/auth');
const { addUpdate, getFieldUpdates } = require('../controllers/updatesController');

router.post('/', authenticate, authorise('admin', 'agent'), addUpdate);
router.get('/:field_id', authenticate, authorise('admin', 'agent'), getFieldUpdates);

module.exports = router;
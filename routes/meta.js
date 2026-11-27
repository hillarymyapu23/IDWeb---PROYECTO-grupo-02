const express = require('express');
const ctrl = require('../controllers/metaController');
const router = express.Router();

router.get('/', ctrl.getMeta);

module.exports = router;

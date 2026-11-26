const express = require('express');
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/perfilController');
const router = express.Router();

router.get('/', authMiddleware, ctrl.getPerfil);

module.exports = router;

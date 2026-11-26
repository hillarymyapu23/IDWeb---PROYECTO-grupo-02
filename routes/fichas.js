const express = require('express');
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/fichasController');
const router = express.Router();

router.get('/', ctrl.listar);                          // público
router.post('/', authMiddleware, ctrl.crear);          // solo asesor con sesión
router.delete('/:id', authMiddleware, ctrl.eliminar);  // solo el dueño

module.exports = router;

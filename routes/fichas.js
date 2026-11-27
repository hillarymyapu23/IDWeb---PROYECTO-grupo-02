const express = require('express');
const authMiddleware = require('../middleware/auth');
const ctrl = require('../controllers/fichasController');
const router = express.Router();

router.get('/', ctrl.listar);                            // público
router.get('/mias', authMiddleware, ctrl.mias);          // solo asesor con sesión (va antes de /:id)
router.post('/', authMiddleware, ctrl.crear);            // solo asesor con sesión
router.put('/:id', authMiddleware, ctrl.actualizar);     // solo el autor
router.delete('/:id', authMiddleware, ctrl.eliminar);    // solo el autor

module.exports = router;

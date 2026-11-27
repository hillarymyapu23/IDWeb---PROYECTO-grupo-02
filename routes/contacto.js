const express = require('express');
const authMiddleware = require('../middleware/auth');
const limitador = require('../middleware/limitador');
const ctrl = require('../controllers/contactoController');
const router = express.Router();

const limiteContacto = limitador({ ventanaMs: 10 * 60 * 1000, max: 10, mensaje: 'Enviaste muchos mensajes seguidos. Espera unos minutos.' });

router.post('/', limiteContacto, ctrl.enviar);        // público
router.get('/', authMiddleware, ctrl.listar);         // solo asesores
router.delete('/:id', authMiddleware, ctrl.eliminar); // solo asesores

module.exports = router;

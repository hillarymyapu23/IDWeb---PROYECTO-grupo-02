const express = require('express');
const ctrl = require('../controllers/authController');
const limitador = require('../middleware/limitador');
const router = express.Router();

const limiteLogin = limitador({ ventanaMs: 10 * 60 * 1000, max: 30, mensaje: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' });
const limiteRegistro = limitador({ ventanaMs: 60 * 60 * 1000, max: 30, mensaje: 'Demasiados registros desde esta red. Intenta más tarde.' });

router.post('/register', limiteRegistro, ctrl.register);
router.post('/login', limiteLogin, ctrl.login);
router.post('/logout', ctrl.logout);   // pública a propósito
router.get('/sesion', ctrl.sesion);    // pública: dice si hay sesión sin dar 401

module.exports = router;

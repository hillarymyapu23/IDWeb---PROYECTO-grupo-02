const express = require('express');
const router = express.Router();
const fichasController = require('../controllers/fichasController');
const requireAuth = require('../middleware/auth');

router.get('/', fichasController.getAllFichas);
router.get('/:id', fichasController.getFichaById);
router.post('/', requireAuth, fichasController.createFicha);
router.put('/:id', requireAuth, fichasController.updateFicha);
router.delete('/:id', requireAuth, fichasController.deleteFicha);

module.exports = router;

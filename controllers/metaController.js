const { CATEGORIAS, ETAPAS, ASUNTOS } = require('../data/categorias');

// Categorías, etapas y asuntos: el frontend arma menús, filtros y formularios con esto
exports.getMeta = (req, res) => {
  res.status(200).json({ status: 'success', data: { categorias: CATEGORIAS, etapas: ETAPAS, asuntos: ASUNTOS } });
};

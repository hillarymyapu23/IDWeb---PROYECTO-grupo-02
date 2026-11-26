// Middleware de errores: se reconoce porque tiene 4 parámetros (err, req, res, next).
module.exports = (err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'fail', message: 'JSON inválido' });
  }
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
};

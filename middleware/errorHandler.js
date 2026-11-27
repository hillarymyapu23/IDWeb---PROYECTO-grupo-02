// Middleware de errores: se reconoce porque tiene 4 parámetros (err, req, res, next).
module.exports = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'fail', message: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ status: 'fail', message: 'La petición es demasiado grande' });
  }
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
};

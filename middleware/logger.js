// Middleware de auditoría: imprime método, URL, código y tiempo de respuesta.
// No registra el cuerpo de la petición para no filtrar contraseñas en los logs.
module.exports = (req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
};

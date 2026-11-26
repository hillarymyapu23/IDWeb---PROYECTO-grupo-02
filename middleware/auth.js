// Si hay sesión con userId deja pasar (next). Si no, corta con 401.
module.exports = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ status: 'fail', message: 'Acceso no autorizado' });
};

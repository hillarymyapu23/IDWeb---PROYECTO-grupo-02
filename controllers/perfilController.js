const { users } = require('../data/store');

exports.getPerfil = (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  if (!user) return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
  res.status(200).json({ status: 'success', data: { id: user.id, nombre: user.nombre, email: user.email } }); // sin hash
};

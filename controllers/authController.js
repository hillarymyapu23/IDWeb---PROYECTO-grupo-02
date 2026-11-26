const bcrypt = require('bcryptjs');
const { users, contadores } = require('../data/store');

exports.register = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email y password son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: 'fail', message: 'La password debe tener al menos 6 caracteres' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ status: 'fail', message: 'Ese email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10); // 10 salt rounds, asíncrono
    const user = { id: contadores.user++, email, passwordHash };
    users.push(user);

    res.status(201).json({ status: 'success', data: { id: user.id, email: user.email } }); // sin hash
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = users.find(u => u.email === email);
    // Mismo mensaje si falla email o password: no damos pistas a un atacante
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ status: 'fail', message: 'Credenciales inválidas' });
    }

    req.session.userId = user.id; // Aquí se abre la sesión
    res.status(200).json({ status: 'success', message: 'Sesión iniciada' });
  } catch (err) { next(err); }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
  });
};

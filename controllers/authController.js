const bcrypt = require('bcryptjs');
const { users, contadores } = require('../data/store');
const { texto, email: validarEmail } = require('../middleware/validar');

const SALT_ROUNDS = 10;
const PASSWORD_MIN = 8;
const PASSWORD_MAX_BYTES = 72; // bcrypt solo usa los primeros 72 bytes de la contraseña

// Hash de relleno: si el correo no existe igual hacemos un bcrypt.compare,
// así el login tarda lo mismo y no revela qué correos están registrados.
const HASH_FALSO = bcrypt.hashSync('contraseña-que-nadie-usa', SALT_ROUNDS);

exports.register = async (req, res, next) => {
  try {
    const nombre = texto(req.body.nombre, 2, 60);
    const email = validarEmail(req.body.email);
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!nombre) return res.status(400).json({ status: 'fail', message: 'Escribe tu nombre (entre 2 y 60 caracteres)' });
    if (!email) return res.status(400).json({ status: 'fail', message: 'Escribe un correo válido, por ejemplo asesor@correo.com' });
    if (password.length < PASSWORD_MIN) {
      return res.status(400).json({ status: 'fail', message: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres` });
    }
    if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
      return res.status(400).json({ status: 'fail', message: `La contraseña no puede superar los ${PASSWORD_MAX_BYTES} caracteres` });
    }
    if (users.some(u => u.email === email)) {
      return res.status(409).json({ status: 'fail', message: 'Ese correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS); // asíncrono, con salt automático
    const user = { id: contadores.user++, nombre, email, passwordHash };
    users.push(user);

    // Nunca se devuelve el hash
    res.status(201).json({ status: 'success', message: 'Cuenta creada', data: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const email = validarEmail(req.body.email);
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    const user = email ? users.find(u => u.email === email) : null;
    const coincide = await bcrypt.compare(password, user ? user.passwordHash : HASH_FALSO);

    // Mismo mensaje si falla el correo o la contraseña: no damos pistas a un atacante
    if (!user || !coincide) {
      return res.status(401).json({ status: 'fail', message: 'Correo o contraseña incorrectos' });
    }

    // regenerate() crea un ID de sesión nuevo al autenticarse (previene la fijación de sesión)
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id; // Aquí se abre la sesión
      req.session.save((err2) => {
        if (err2) return next(err2);
        res.status(200).json({ status: 'success', message: 'Sesión iniciada', data: { id: user.id, nombre: user.nombre, email: user.email } });
      });
    });
  } catch (err) { next(err); }
};

// Pública: responde siempre 200 para que el menú sepa si hay sesión sin generar un error 401 en la consola
exports.sesion = (req, res) => {
  const user = req.session && req.session.userId ? users.find(u => u.id === req.session.userId) : null;
  res.status(200).json({ status: 'success', data: { autenticado: Boolean(user), nombre: user ? user.nombre : null } });
};

// Pública a propósito: si la sesión ya venció, cerrar sesión igual debe responder bien
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
  });
};

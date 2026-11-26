require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');
const fichasRoutes = require('./routes/fichas');

const app = express();

app.use(express.json()); // Lee el body JSON
app.use(logger);

app.use(session({
  secret: process.env.SESSION_SECRET, //cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/fichas', fichasRoutes);

app.use('/api', (req, res) => res.status(404).json({ status: 'fail', message: 'Ruta no encontrada' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

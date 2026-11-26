require('dotenv').config(); // Carga el .env en process.env

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
  secret: process.env.SESSION_SECRET, // Firma la cookie; nunca va escrito en el código
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,                                // JS del navegador no puede leerla (anti-XSS)
    sameSite: 'lax',                               // Ayuda contra CSRF
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    maxAge: 1000 * 60 * 60                         // 1 hora
  }
}));

app.use(express.static(path.join(__dirname, 'public'))); // Sirve el FrontEnd

app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/fichas', fichasRoutes);

app.use('/api', (req, res) => res.status(404).json({ status: 'fail', message: 'Ruta no encontrada' }));

app.use(errorHandler); // Siempre al final

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

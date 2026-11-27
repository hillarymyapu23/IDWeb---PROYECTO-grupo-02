require('dotenv').config(); // Carga el .env en process.env

const express = require('express');
const session = require('express-session');
const path = require('path');

const cabeceras = require('./middleware/cabeceras');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');
const fichasRoutes = require('./routes/fichas');
const contactoRoutes = require('./routes/contacto');
const metaRoutes = require('./routes/meta');

// Sin secreto no se arranca: así nunca se firma la cookie con un valor conocido.
if (!process.env.SESSION_SECRET) {
  console.error('Falta SESSION_SECRET. Ejecuta "npm run setup" para crear tu archivo .env.');
  process.exit(1);
}

const app = express();
const produccion = process.env.NODE_ENV === 'production';
const publico = path.join(__dirname, 'public');

app.disable('x-powered-by');
if (produccion) app.set('trust proxy', 1); // Render/Railway (Lab 09): HTTPS llega por un proxy

app.use(cabeceras);
app.use(express.json({ limit: '50kb' })); // Lee el body JSON
app.use(logger);

app.use(session({
  secret: process.env.SESSION_SECRET, // Firma la cookie; nunca va escrito en el código
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,       // JS del navegador no puede leerla (anti-XSS)
    sameSite: 'lax',      // Ayuda contra CSRF
    secure: produccion,   // Solo HTTPS en producción
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));

app.use(express.static(publico)); // Sirve el FrontEnd

app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/fichas', fichasRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/meta', metaRoutes);

app.use('/api', (req, res) => res.status(404).json({ status: 'fail', message: 'Ruta de la API no encontrada' }));
app.use((req, res) => res.status(404).sendFile(path.join(publico, '404.html'))); // páginas que no existen

app.use(errorHandler); // Siempre al final

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

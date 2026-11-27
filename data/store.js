// "Base de datos" temporal en memoria. Se borra al reiniciar el servidor.
// En el Lab 08 se reemplaza por PostgreSQL (ver README, sección "Siguientes pasos").
const { FICHAS_EJEMPLO, EQUIPO } = require('./seed');

const users = [];     // { id, nombre, email, passwordHash }
const mensajes = [];  // { id, nombre, email, asunto, mensaje, fecha }

const base = Date.parse('2026-11-01T12:00:00Z');
const fichas = FICHAS_EJEMPLO.map((f, i) => ({
  id: i + 1,
  userId: null,                 // null = ficha del equipo (no editable)
  asesor: EQUIPO,
  ...f,
  creado: new Date(base + i * 3600 * 1000).toISOString()
}));

// Contadores independientes: un ID nunca se reutiliza aunque se borren registros
const contadores = { user: 1, ficha: fichas.length + 1, mensaje: 1 };

module.exports = { users, fichas, mensajes, contadores };

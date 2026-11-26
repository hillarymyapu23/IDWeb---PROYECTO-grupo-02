// "Base de datos" temporal en memoria. Se borra al reiniciar el servidor.
// En el Lab 08 se reemplaza por PostgreSQL.
const users = [];   // { id, email, passwordHash }
const fichas = [];  // { id, userId, categoria, titulo, producto, precio, edad }
const contadores = { user: 1, ficha: 1 };

module.exports = { users, fichas, contadores };

// "Base de datos" temporal en memoria la cual se borra al reiniciar el servidor
const users = [];   // { id, email, passwordHash }
const fichas = [];  // { id, userId, categoria, titulo, producto, precio, edad }
const contadores = { user: 1, ficha: 1 };

module.exports = { users, fichas, contadores };

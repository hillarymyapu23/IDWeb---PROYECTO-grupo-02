const { mensajes, contadores } = require('../data/store');
const { ASUNTOS } = require('../data/categorias');
const { texto, email: validarEmail } = require('../middleware/validar');

const MAX_MENSAJES = 200; // tope para que la memoria del servidor no crezca sin límite

// POST /api/contacto   (público)
exports.enviar = (req, res) => {
  // Campo trampa: está oculto para las personas; si viene lleno es un robot. Se responde "ok" y se descarta.
  if (typeof req.body.sitio === 'string' && req.body.sitio.trim() !== '') {
    return res.status(201).json({ status: 'success', message: 'Mensaje enviado' });
  }

  const nombre = texto(req.body.nombre, 2, 60);
  const email = validarEmail(req.body.email);
  const asunto = ASUNTOS.find(a => a.slug === req.body.asunto);
  const mensaje = texto(req.body.mensaje, 10, 1000);

  if (!nombre) return res.status(400).json({ status: 'fail', message: 'Escribe tu nombre (entre 2 y 60 caracteres)' });
  if (!email) return res.status(400).json({ status: 'fail', message: 'Escribe un correo válido para poder responderte' });
  if (!asunto) return res.status(400).json({ status: 'fail', message: 'Elige un asunto' });
  if (!mensaje) return res.status(400).json({ status: 'fail', message: 'El mensaje debe tener entre 10 y 1000 caracteres' });

  mensajes.push({ id: contadores.mensaje++, nombre, email, asunto: asunto.slug, mensaje, fecha: new Date().toISOString() });
  if (mensajes.length > MAX_MENSAJES) mensajes.shift();

  res.status(201).json({ status: 'success', message: 'Mensaje enviado. Te responderemos al correo que indicaste.' });
};

// GET /api/contacto   (protegida: solo asesores)
exports.listar = (req, res) => {
  const lista = mensajes.slice().sort((a, b) => b.id - a.id);
  res.status(200).json({ status: 'success', total: lista.length, data: lista });
};

// DELETE /api/contacto/:id   (protegida)
exports.eliminar = (req, res) => {
  const index = mensajes.findIndex(m => m.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ status: 'fail', message: 'Mensaje no encontrado' });
  mensajes.splice(index, 1);
  res.status(200).json({ status: 'success', message: 'Mensaje eliminado' });
};

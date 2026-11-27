const { fichas, users, contadores } = require('../data/store');
const { CATEGORIAS, ETAPAS } = require('../data/categorias');
const { texto, precio: validarPrecio } = require('../middleware/validar');

const SLUGS_CATEGORIA = CATEGORIAS.map(c => c.slug);
const SLUGS_ETAPA = ETAPAS.map(e => e.slug);

// Para buscar sin importar mayúsculas ni tildes: "cuna" encuentra "Cuña", "lluvia" encuentra "LLUVIA"
const normalizar = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Lo que se muestra al público: se agrega el nombre del asesor y NO se expone userId
function publica(f) {
  const autor = f.userId ? users.find(u => u.id === f.userId) : null;
  const { userId, ...resto } = f;
  return { ...resto, asesor: autor ? autor.nombre : f.asesor };
}

// Valida y normaliza el cuerpo de una ficha. Devuelve { error } o { valores }.
function validar(body) {
  const titulo = texto(body.titulo, 5, 80);
  const producto = texto(body.producto, 3, 100);
  const edad = texto(body.edad, 1, 40);
  const descripcion = texto(body.descripcion, 10, 500);
  const precio = validarPrecio(body.precio);

  if (!SLUGS_CATEGORIA.includes(body.categoria)) return { error: 'Elige una categoría válida' };
  if (!SLUGS_ETAPA.includes(body.etapa)) return { error: 'Elige una etapa válida' };
  if (!titulo) return { error: 'El título debe tener entre 5 y 80 caracteres' };
  if (!producto) return { error: 'El producto debe tener entre 3 y 100 caracteres' };
  if (!precio) return { error: 'El precio debe ser un número mayor que 0' };
  if (!edad) return { error: 'Indica la edad recomendada (hasta 40 caracteres)' };
  if (!descripcion) return { error: 'La descripción debe tener entre 10 y 500 caracteres' };

  return { valores: { categoria: body.categoria, etapa: body.etapa, titulo, producto, precio, edad, descripcion } };
}

// GET /api/fichas?categoria=&etapa=&q=&orden=&ids=&limit=   (público)
exports.listar = (req, res) => {
  const { categoria, etapa, q, orden, ids, limit } = req.query;
  let lista = fichas.slice();

  if (typeof categoria === 'string' && categoria) lista = lista.filter(f => f.categoria === categoria);
  if (typeof etapa === 'string' && etapa) lista = lista.filter(f => f.etapa === etapa);
  if (typeof ids === 'string' && ids) {
    const set = new Set(ids.split(',').map(Number).filter(Number.isInteger));
    lista = lista.filter(f => set.has(f.id));
  }
  if (typeof q === 'string' && q.trim()) {
    const t = normalizar(q.trim());
    lista = lista.filter(f => normalizar([f.titulo, f.producto, f.descripcion, f.edad].join(' ')).includes(t));
  }

  if (orden === 'precio-asc') lista.sort((a, b) => a.precio - b.precio);
  else if (orden === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
  else lista.sort((a, b) => b.id - a.id); // recientes

  const total = lista.length;
  const tope = Math.min(Math.max(parseInt(limit, 10) || total, 1), 100);
  res.status(200).json({ status: 'success', total, data: lista.slice(0, tope).map(publica) });
};

// GET /api/fichas/mias   (protegida)
exports.mias = (req, res) => {
  const lista = fichas.filter(f => f.userId === req.session.userId).sort((a, b) => b.id - a.id);
  res.status(200).json({ status: 'success', total: lista.length, data: lista.map(publica) });
};

// POST /api/fichas   (protegida)
exports.crear = (req, res) => {
  const { error, valores } = validar(req.body);
  if (error) return res.status(400).json({ status: 'fail', message: error });

  const ficha = { id: contadores.ficha++, userId: req.session.userId, ...valores, creado: new Date().toISOString() };
  fichas.push(ficha);
  res.status(201).json({ status: 'success', data: publica(ficha) });
};

// PUT /api/fichas/:id   (protegida, solo el autor)
exports.actualizar = (req, res) => {
  const ficha = fichas.find(f => f.id === Number(req.params.id));
  if (!ficha) return res.status(404).json({ status: 'fail', message: 'Ficha no encontrada' });
  if (ficha.userId !== req.session.userId) {
    return res.status(403).json({ status: 'fail', message: 'Solo el autor de la ficha puede editarla' });
  }
  const { error, valores } = validar(req.body);
  if (error) return res.status(400).json({ status: 'fail', message: error });

  Object.assign(ficha, valores, { actualizado: new Date().toISOString() });
  res.status(200).json({ status: 'success', data: publica(ficha) });
};

// DELETE /api/fichas/:id   (protegida, solo el autor)
exports.eliminar = (req, res) => {
  const index = fichas.findIndex(f => f.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ status: 'fail', message: 'Ficha no encontrada' });
  if (fichas[index].userId !== req.session.userId) {
    return res.status(403).json({ status: 'fail', message: 'Solo el autor de la ficha puede eliminarla' });
  }
  fichas.splice(index, 1);
  res.status(200).json({ status: 'success', message: 'Ficha eliminada' });
};

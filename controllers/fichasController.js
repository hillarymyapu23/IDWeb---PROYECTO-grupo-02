// [Lab 05 & 06] Controlador CRUD con validación estricta anti-inyección y límites
const fs = require('fs').promises;
const path = require('path');

const FICHAS_PATH = path.join(__dirname, '..', 'data', 'fichas.json');

const CATEGORIAS_OFICIALES = [
  'Asientos de seguridad para autos',
  'Camas cuna',
  'Coches para bebés y accesorios',
  'Cunas Infantiles',
  'Cunas para bebes'
];

const IMAGEN_POR_CATEGORIA = {
  'Asientos de seguridad para autos': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
  'Camas cuna': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
  'Coches para bebés y accesorios': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
  'Cunas Infantiles': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  'Cunas para bebes': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80'
};

async function leerFichas() {
  const raw = await fs.readFile(FICHAS_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function guardarFichas(fichas) {
  await fs.writeFile(FICHAS_PATH, JSON.stringify(fichas, null, 2));
}

// Función de validación rigurosa de payload
function validarDatosFicha(body) {
  const { titulo, categoria, producto, precio, edadRecomendada, descripcion, imagen } = body;

  if (typeof titulo !== 'string' || titulo.trim().length < 5 || titulo.trim().length > 120) {
    return 'El título debe ser un texto válido entre 5 y 120 caracteres.';
  }
  if (typeof categoria !== 'string' || !CATEGORIAS_OFICIALES.includes(categoria)) {
    return 'Debe seleccionar una de las 5 categorías oficiales.';
  }
  if (typeof producto !== 'string' || producto.trim().length < 3 || producto.trim().length > 100) {
    return 'El nombre del producto debe tener entre 3 y 100 caracteres.';
  }
  if (typeof edadRecomendada !== 'string' || edadRecomendada.trim().length < 3 || edadRecomendada.trim().length > 60) {
    return 'La edad recomendada debe tener entre 3 y 60 caracteres.';
  }
  if (typeof descripcion !== 'string' || descripcion.trim().length < 10 || descripcion.trim().length > 500) {
    return 'La descripción debe tener entre 10 y 500 caracteres.';
  }

  // Bloquea precios como "1e999" (Infinity), NaN, negativos o mayores a 50,000
  const precioNum = Number(precio);
  if (typeof precio === 'object' || !Number.isFinite(precioNum) || precioNum <= 0 || precioNum > 50000) {
    return 'El precio debe ser un número válido mayor a S/ 0 y menor a S/ 50,000.';
  }

  if (imagen !== undefined && imagen !== '' && typeof imagen !== 'string') {
    return 'La URL de la imagen debe ser texto válido.';
  }

  return null;
}

exports.getAllFichas = async (req, res, next) => {
  try {
    let fichas = await leerFichas();
    const { categoria } = req.query;

    if (categoria && categoria !== 'Todas') {
      fichas = fichas.filter((f) => f.categoria === categoria);
    }

    res.status(200).json({ status: 'success', results: fichas.length, data: fichas });
  } catch (err) {
    next(err);
  }
};

exports.getFichaById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ status: 'fail', message: 'ID inválido.' });

    const fichas = await leerFichas();
    const ficha = fichas.find((f) => f.id === id);

    if (!ficha) return res.status(404).json({ status: 'fail', message: 'Ficha no encontrada.' });
    res.status(200).json({ status: 'success', data: ficha });
  } catch (err) {
    next(err);
  }
};

exports.createFicha = async (req, res, next) => {
  try {
    const errorValidacion = validarDatosFicha(req.body);
    if (errorValidacion) {
      return res.status(400).json({ status: 'fail', message: errorValidacion });
    }

    const { titulo, categoria, producto, precio, edadRecomendada, descripcion, imagen } = req.body;
    const fichas = await leerFichas();

    const nuevaFicha = {
      id: fichas.length ? Math.max(...fichas.map((f) => f.id)) + 1 : 1,
      titulo: titulo.trim(),
      categoria,
      producto: producto.trim(),
      precio: Math.round(Number(precio) * 100) / 100,
      edadRecomendada: edadRecomendada.trim(),
      imagen: imagen && imagen.trim().startsWith('http') ? imagen.trim() : IMAGEN_POR_CATEGORIA[categoria],
      descripcion: descripcion.trim(),
      asesor: req.session.userNombre || 'Asesor Especialista'
    };

    fichas.push(nuevaFicha);
    await guardarFichas(fichas);

    res.status(201).json({ status: 'success', data: nuevaFicha });
  } catch (err) {
    next(err);
  }
};

// PUT /api/fichas/:id (Reparado y conectado correctamente)
exports.updateFicha = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ status: 'fail', message: 'ID inválido.' });

    const errorValidacion = validarDatosFicha(req.body);
    if (errorValidacion) {
      return res.status(400).json({ status: 'fail', message: errorValidacion });
    }

    const fichas = await leerFichas();
    const index = fichas.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ status: 'fail', message: 'Ficha no encontrada para actualizar.' });
    }

    const { titulo, categoria, producto, precio, edadRecomendada, descripcion, imagen } = req.body;

    fichas[index] = {
      ...fichas[index],
      titulo: titulo.trim(),
      categoria,
      producto: producto.trim(),
      precio: Math.round(Number(precio) * 100) / 100,
      edadRecomendada: edadRecomendada.trim(),
      imagen: imagen && imagen.trim().startsWith('http') ? imagen.trim() : IMAGEN_POR_CATEGORIA[categoria],
      descripcion: descripcion.trim()
    };

    await guardarFichas(fichas);
    res.status(200).json({ status: 'success', data: fichas[index] });
  } catch (err) {
    next(err);
  }
};

exports.deleteFicha = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ status: 'fail', message: 'ID inválido.' });

    const fichas = await leerFichas();
    const index = fichas.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ status: 'fail', message: 'Ficha no encontrada.' });
    }

    fichas.splice(index, 1);
    await guardarFichas(fichas);
    res.status(200).json({ status: 'success', message: 'Ficha eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
};
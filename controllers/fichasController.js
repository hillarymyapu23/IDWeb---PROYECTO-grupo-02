const { fichas, contadores } = require('../data/store');

const CATEGORIAS = ['asientos-auto', 'camas-cuna', 'coches-bebe', 'cunas-infantiles', 'cunas-bebes'];

exports.listar = (req, res) => {
  const { categoria } = req.query; // /api/fichas?categoria=coches-bebe
  const data = categoria ? fichas.filter(f => f.categoria === categoria) : fichas;
  res.status(200).json({ status: 'success', data });
};

exports.crear = (req, res) => {
  const { categoria, titulo, producto, precio, edad } = req.body;

  if (!categoria || !titulo || !producto || precio === undefined || precio === '' || !edad) {
    return res.status(400).json({ status: 'fail', message: 'Faltan campos obligatorios' });
  }
  if (!CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ status: 'fail', message: 'Categoría inválida' });
  }
  if (isNaN(precio) || Number(precio) <= 0) {
    return res.status(400).json({ status: 'fail', message: 'El precio debe ser un número mayor a 0' });
  }

  const ficha = {
    id: contadores.ficha++,
    userId: req.session.userId,
    categoria, titulo, producto,
    precio: Number(precio),
    edad
  };
  fichas.push(ficha);
  res.status(201).json({ status: 'success', data: ficha });
};

exports.eliminar = (req, res) => {
  const index = fichas.findIndex(f => f.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ status: 'fail', message: 'Ficha no encontrada' });
  if (fichas[index].userId !== req.session.userId) {
    return res.status(403).json({ status: 'fail', message: 'No puedes borrar fichas de otro asesor' });
  }
  fichas.splice(index, 1);
  res.status(200).json({ status: 'success', message: 'Ficha eliminada' });
};

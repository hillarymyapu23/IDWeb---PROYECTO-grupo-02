// Limitador de peticiones en memoria (por IP): frena la fuerza bruta sobre el login
// y el envío masivo de formularios. Responde 429 al pasarse del máximo.
module.exports = function limitador({ ventanaMs, max, mensaje }) {
  const registro = new Map(); // ip -> { cuenta, reinicia }

  // Limpieza periódica para que el mapa no crezca sin límite
  const limpieza = setInterval(() => {
    const ahora = Date.now();
    for (const [ip, r] of registro) if (r.reinicia <= ahora) registro.delete(ip);
  }, ventanaMs);
  limpieza.unref();

  return (req, res, next) => {
    const ahora = Date.now();
    let r = registro.get(req.ip);
    if (!r || r.reinicia <= ahora) {
      r = { cuenta: 0, reinicia: ahora + ventanaMs };
      registro.set(req.ip, r);
    }
    r.cuenta += 1;
    if (r.cuenta > max) {
      res.set('Retry-After', String(Math.ceil((r.reinicia - ahora) / 1000)));
      return res.status(429).json({ status: 'fail', message: mensaje });
    }
    next();
  };
};

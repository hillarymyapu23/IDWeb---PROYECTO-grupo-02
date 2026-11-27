// Ayudas de validación compartidas por los controladores.
// Todo lo que llega en req.body es desconocido: puede ser un número, un objeto o un texto enorme.

// Devuelve el texto limpio si es un string con largo entre min y max; si no, null.
function texto(valor, min, max) {
  if (typeof valor !== 'string') return null;
  const limpio = valor.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  if (limpio.length < min || limpio.length > max) return null;
  return limpio;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function email(valor) {
  const t = texto(valor, 5, 120);
  return t && EMAIL.test(t) ? t.toLowerCase() : null;
}

// Acepta "12.5", 12.5 o "12,5"; rechaza NaN, Infinity, negativos y 0.
function precio(valor, max = 100000) {
  if (typeof valor !== 'number' && typeof valor !== 'string') return null;
  const n = Number(typeof valor === 'string' ? valor.replace(',', '.') : valor);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return Math.round(n * 100) / 100;
}

module.exports = { texto, email, precio };

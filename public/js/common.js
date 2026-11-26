// Utilidades compartidas por todas las páginas.
const CATEGORIAS = {
  'asientos-auto': 'Asientos de auto',
  'camas-cuna': 'Camas cuna',
  'coches-bebe': 'Coches para bebé',
  'cunas-infantiles': 'Cunas infantiles',
  'cunas-bebes': 'Cunas para bebés'
};

// Escapa texto para que lo escrito por un usuario no se ejecute como HTML (anti-XSS)
const esc = (s) => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Envuelve fetch: manda JSON y lanza un Error con el mensaje del servidor si falla
async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Error en la petición'), { status: res.status });
  return data;
}

function showAlert(el, msg, tipo = 'danger') {
  el.innerHTML = `<div class="alert alert-${tipo}" role="alert">${esc(msg)}</div>`;
}

function cardHTML(f, borrable = false) {
  return `
    <article class="ficha">
      <span class="ficha-cat">${esc(CATEGORIAS[f.categoria] || f.categoria)}</span>
      <h3>${esc(f.titulo)}</h3>
      <p class="ficha-prod">${esc(f.producto)}</p>
      <dl class="ficha-datos">
        <div><dt>Precio aprox.</dt><dd>S/ ${Number(f.precio).toFixed(2)}</dd></div>
        <div><dt>Edad</dt><dd>${esc(f.edad)}</dd></div>
      </dl>
      ${borrable ? `<button class="btn btn-sm btn-outline-danger" data-borrar="${f.id}">Eliminar</button>` : ''}
    </article>`;
}

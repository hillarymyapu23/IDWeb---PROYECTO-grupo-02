// [Yaritza - Lab 04 & 07] Utilidades compartidas: anti-XSS, wrapper Fetch, sesión 401 y localStorage

const CATEGORIAS = {
  'asientos-auto': 'Asientos de seguridad para autos',
  'camas-cuna': 'Camas cuna',
  'coches-bebe': 'Coches para bebés y accesorios',
  'cunas-infantiles': 'Cunas Infantiles',
  'cunas-bebes': 'Cunas para bebes'
};

// Normaliza cualquier formato de categoría (slug o nombre completo)
function nombreCategoria(cat) {
  return CATEGORIAS[cat] || cat || 'General';
}

// Escapa texto para evitar inyección HTML (anti-XSS)
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

// Alias por compatibilidad
const escapeHTML = esc;

// Envuelve fetch: envía cookies de sesión, maneja JSON y redirige al login si vence la sesión (401)
async function api(url, method = 'GET', body, opciones = { redirigirEn401: true }) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Si el servidor responde 401 en una acción protegida, limpia estado y abre Login / redirige
    if (res.status === 401 && opciones.redirigirEn401) {
      localStorage.removeItem('guiapeques_asesor');
      const modalAuthEl = document.querySelector('#modalAuth');
      if (modalAuthEl && window.bootstrap) {
        bootstrap.Modal.getOrCreateInstance(modalAuthEl).show();
      } else if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = '/index.html?login=1';
      }
    }
    throw Object.assign(new Error(data.message || 'Error en la petición'), { status: res.status });
  }

  return data;
}

// Muestra alertas Bootstrap de forma segura (escapando el texto)
function showAlert(el, msg, tipo = 'danger') {
  if (!el) return;
  el.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${esc(msg)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>`;
}

// ==========================================
// Gestión de Favoritos en localStorage (Lab 04)
// ==========================================
const FAV_KEY = 'guiapeques_favoritos';

function getFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
}

function toggleFavoritoStorage(id) {
  const numId = Number(id);
  let favs = getFavoritos();
  favs = favs.includes(numId) ? favs.filter((f) => f !== numId) : [...favs, numId];
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return favs;
}

// ==========================================
// Renderizado de Tarjeta (Compatible con tu estructura + acciones CRUD)
// ==========================================
function cardHTML(f, editable = false) {
  const esFav = getFavoritos().includes(Number(f.id));
  const edadTexto = f.edadRecomendada || f.edad || 'Todas las etapas';
  const imgUrl = f.imagen || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80';

  return `
    <article class="ficha card h-100 shadow-sm">
      <div class="position-relative">
        <img src="${esc(imgUrl)}" alt="${esc(f.producto)}" class="ficha-img card-img-top" />
        <button type="button"
                class="btn btn-sm ${esFav ? 'btn-danger' : 'btn-light'} position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                data-fav="${f.id}"
                title="Guardar en favoritos">
          <i class="bi ${esFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
      </div>

      <div class="card-body d-flex flex-column justify-content-between">
        <div>
          <span class="ficha-cat badge bg-warning-subtle text-dark border mb-2">
            ${esc(nombreCategoria(f.categoria))}
          </span>
          <h3 class="h6 fw-bold">${esc(f.titulo)}</h3>
          <p class="ficha-prod small text-muted mb-2">${esc(f.producto)}</p>
        </div>

        <div>
          <dl class="ficha-datos bg-light rounded p-2 small mb-3">
            <div class="d-flex justify-content-between">
              <dt class="fw-normal text-muted">Precio aprox.</dt>
              <dd class="fw-bold text-success mb-0">S/ ${Number(f.precio).toFixed(2)}</dd>
            </div>
            <div class="d-flex justify-content-between mt-1">
              <dt class="fw-normal text-muted">Edad</dt>
              <dd class="fw-semibold mb-0">${esc(edadTexto)}</dd>
            </div>
          </dl>

          <div class="d-flex justify-content-between align-items-center pt-2 border-top">
            <button type="button" class="btn btn-sm btn-outline-dark" data-detalle="${f.id}">Ver detalle</button>
            ${
              editable
                ? `<div class="btn-group btn-group-sm">
                     <button type="button" class="btn btn-outline-primary" data-editar="${f.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                     <button type="button" class="btn btn-outline-danger" data-borrar="${f.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
                   </div>`
                : `<small class="text-muted">${esc(f.asesor || 'Especialista')}</small>`
            }
          </div>
        </div>
      </div>
    </article>`;
}
// [Yaritza] Lógica de la portada pública (public/index.html)
// Depende de: js/common.js (CATEGORIAS, esc, api, cardHTML, getFavoritos, toggleFavoritoStorage, FAV_KEY)

const lista = document.querySelector('#lista');
const filtro = document.querySelector('#filtro');
const busqueda = document.querySelector('#busqueda');
const orden = document.querySelector('#orden');
const favCountEl = document.querySelector('#fav-count');
const alertBox = document.querySelector('#alert-box');

let fichasCache = [];
let soloFavoritos = false;

// 1. Poblar selector de categorías desde CATEGORIAS (common.js)
filtro.innerHTML =
  '<option value="">Todas las categorías (5)</option>' +
  Object.entries(CATEGORIAS)
    .map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`)
    .join('');

// Recuperar último filtro guardado en localStorage
filtro.value = localStorage.getItem('primeros_pasos_filtro') || '';

// 2. Cargar fichas desde la API REST
async function cargar() {
  try {
    const q = filtro.value ? `?categoria=${encodeURIComponent(filtro.value)}` : '';
    const { data } = await api('/api/fichas' + q);
    fichasCache = data || [];

    // Si estamos viendo todas, limpiar favoritos huérfanos en localStorage
    if (!filtro.value) {
      const idsValidos = new Set(fichasCache.map((f) => Number(f.id)));
      const favsLimpios = getFavoritos().filter((id) => idsValidos.has(id));
      localStorage.setItem(FAV_KEY, JSON.stringify(favsLimpios));
    }

    actualizarContadorFavs();
    renderizar();
  } catch (err) {
    lista.innerHTML = '<p class="text-danger">No se pudieron cargar las guías.</p>';
    if (alertBox) showAlert(alertBox, err.message, 'danger');
  }
}

// 3. Aplicar búsqueda, favoritos, ordenamiento y pintar tarjetas
function renderizar() {
  const texto = (busqueda?.value || '').trim().toLowerCase();
  const criterioOrden = orden?.value || 'recientes';
  const favs = getFavoritos();

  let resultado = [...fichasCache];

  if (soloFavoritos) {
    resultado = resultado.filter((f) => favs.includes(Number(f.id)));
  }

  if (texto) {
    resultado = resultado.filter((f) => {
      const edad = f.edadRecomendada || f.edad || '';
      return (
        f.titulo.toLowerCase().includes(texto) ||
        f.producto.toLowerCase().includes(texto) ||
        edad.toLowerCase().includes(texto)
      );
    });
  }

  if (criterioOrden === 'precio-asc') resultado.sort((a, b) => Number(a.precio) - Number(b.precio));
  if (criterioOrden === 'precio-desc') resultado.sort((a, b) => Number(b.precio) - Number(a.precio));
  if (criterioOrden === 'recientes') resultado.sort((a, b) => Number(b.id) - Number(a.id));

  lista.innerHTML = resultado.length
    ? resultado.map((f) => cardHTML(f, false)).join('')
    : '<p class="text-muted">Todavía no hay guías que coincidan con este filtro.</p>';
}

function actualizarContadorFavs() {
  if (favCountEl) favCountEl.textContent = getFavoritos().length;
}

// 4. Actualizar botón del Navbar si el asesor ya inició sesión
async function actualizarNavbarSesion() {
  try {
    const { data } = await api('/api/perfil', 'GET', null, { redirigirEn401: false });
    const loginBtn = document.querySelector('#nav-login-btn');
    if (loginBtn && data) {
      loginBtn.textContent = `Hola, ${data.nombre}`;
      loginBtn.href = 'panel.html';
    }
  } catch {
    // Visitante sin sesión
  }
}

// 5. Modal de vista rápida / detalle
function abrirModalDetalle(id) {
  const f = fichasCache.find((item) => Number(item.id) === id);
  if (!f) return;

  const edadTexto = f.edadRecomendada || f.edad || 'Todas las etapas';
  const imgUrl = f.imagen || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80';

  document.querySelector('#modalDetalleBody').innerHTML = `
    <div class="modal-header">
      <h5 class="modal-title fw-bold">${esc(f.titulo)}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
    </div>
    <div class="modal-body">
      <img src="${esc(imgUrl)}" class="img-fluid rounded mb-3 w-100" style="max-height: 230px; object-fit: cover;" alt="${esc(f.producto)}">
      <p class="mb-1"><strong>Producto recomendado:</strong> ${esc(f.producto)}</p>
      <p class="mb-1"><strong>Categoría:</strong> ${esc(nombreCategoria(f.categoria))}</p>
      <p class="mb-1"><strong>Edad recomendada:</strong> ${esc(edadTexto)}</p>
      <p class="mb-3"><strong>Precio aproximado:</strong> <span class="text-success fw-bold">S/ ${Number(f.precio).toFixed(2)}</span></p>
      <div class="bg-light p-3 rounded small text-secondary">${esc(f.descripcion || 'Recomendación verificada por nuestro equipo.')}</div>
    </div>`;

  bootstrap.Modal.getOrCreateInstance(document.querySelector('#modalDetalle')).show();
}

// 6. Eventos
filtro.addEventListener('change', () => {
  soloFavoritos = false;
  localStorage.setItem('primeros_pasos_filtro', filtro.value);
  cargar();
});

busqueda?.addEventListener('input', renderizar);
orden?.addEventListener('change', renderizar);

document.querySelector('#btn-toggle-favs')?.addEventListener('click', () => {
  soloFavoritos = !soloFavoritos;
  renderizar();
});

// Clics en enlaces del Mega-Menú o tarjetas de categoría (data-filtrar-cat)
document.addEventListener('click', (e) => {
  const linkCat = e.target.closest('[data-filtrar-cat]');
  if (!linkCat) return;
  soloFavoritos = false;
  filtro.value = linkCat.dataset.filtrarCat;
localStorage.setItem('primeros_pasos_filtro', filtro.value);
  cargar();
});

// Delegación de clics dentro de #lista (Favoritos y Ver detalle)
lista.addEventListener('click', (e) => {
  const btnFav = e.target.closest('[data-fav]');
  if (btnFav) {
    toggleFavoritoStorage(btnFav.dataset.fav);
    actualizarContadorFavs();
    renderizar();
    return;
  }

  const btnDetalle = e.target.closest('[data-detalle]');
  if (btnDetalle) {
    abrirModalDetalle(Number(btnDetalle.dataset.detalle));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  actualizarNavbarSesion();
  cargar();
});
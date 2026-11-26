// [Yaritza - Lab 04, 06, 07 & Fetch API] Lógica principal del cliente
// Depende de: /js/common.js

let todasLasFichas = [];
let asesorActivo = null;
let soloFavoritos = false;

// Referencias al DOM
const contenedorFichas = document.querySelector('#fichas-container');
const alertContainer = document.querySelector('#alert-container');
const selectCategoria = document.querySelector('#select-categoria');
const selectOrden = document.querySelector('#select-orden');
const inputBusqueda = document.querySelector('#input-busqueda');
const favCountEl = document.querySelector('#fav-count');

// ==========================================
// 1. INICIALIZACIÓN (DOMContentLoaded - Lab 04)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Recuperar último filtro guardado en localStorage
  const filtroGuardado = localStorage.getItem('guiapeques_categoria') || 'Todas';
  if (selectCategoria) selectCategoria.value = filtroGuardado;

  actualizarContadorFavoritos();
  await verificarSesionInicial();
  await cargarFichas();
  inicializarEventos();

  // Si viene redirigido desde otra página con ?login=1, abrir modal de acceso
  if (new URLSearchParams(window.location.search).get('login') === '1' && !asesorActivo) {
    abrirModal('#modalAuth');
  }
});

// Helper seguro para abrir/cerrar modales de Bootstrap 5
function abrirModal(selector) {
  const el = document.querySelector(selector);
  if (el && window.bootstrap) bootstrap.Modal.getOrCreateInstance(el).show();
}

function cerrarModal(selector) {
  const el = document.querySelector(selector);
  if (el && window.bootstrap) {
    const instance = bootstrap.Modal.getInstance(el);
    if (instance) instance.hide();
  }
}

// ==========================================
// 2. CONTROL DE SESIÓN Y AUTENTICACIÓN (Lab 07)
// ==========================================
async function verificarSesionInicial() {
  try {
    // redirigirEn401: false evita abrir el modal de login a visitantes públicos
    const res = await api('/api/perfil', 'GET', null, { redirigirEn401: false });
    asesorActivo = res.data;
  } catch {
    asesorActivo = null;
  }
  actualizarUIAuth();
}

function actualizarUIAuth() {
  const badge = document.querySelector('#asesor-badge');
  const btnNueva = document.querySelector('#btn-nueva-ficha');
  const btnLogin = document.querySelector('#btn-open-login');
  const btnLogout = document.querySelector('#btn-logout');

  if (asesorActivo) {
    if (badge) {
      badge.textContent = `Asesor: ${asesorActivo.nombre}`;
      badge.classList.remove('d-none');
    }
    btnNueva?.classList.remove('d-none');
    btnLogout?.classList.remove('d-none');
    btnLogin?.classList.add('d-none');
  } else {
    badge?.classList.add('d-none');
    btnNueva?.classList.add('d-none');
    btnLogout?.classList.add('d-none');
    btnLogin?.classList.remove('d-none');
  }
}

// ==========================================
// 3. CARGA, FILTRADO, BÚSQUEDA Y ORDENAMIENTO
// ==========================================
async function cargarFichas() {
  try {
    const res = await api('/api/fichas');
    todasLasFichas = res.data || [];
    aplicarFiltrosYRenderizar();
  } catch (err) {
    showAlert(alertContainer, err.message, 'danger');
  }
}

function aplicarFiltrosYRenderizar() {
  const texto = (inputBusqueda?.value || '').trim().toLowerCase();
  const catSeleccionada = selectCategoria?.value || 'Todas';
  const orden = selectOrden?.value || 'recientes';
  const favoritosIds = getFavoritos();

  let lista = [...todasLasFichas];

  // Filtro de favoritos (localStorage) o por categoría
  if (soloFavoritos) {
    lista = lista.filter((f) => favoritosIds.includes(Number(f.id)));
  } else if (catSeleccionada !== 'Todas') {
    lista = lista.filter(
      (f) => f.categoria === catSeleccionada || nombreCategoria(f.categoria) === catSeleccionada
    );
  }

  // Búsqueda en tiempo real por título, producto o edad
  if (texto) {
    lista = lista.filter((f) => {
      const edad = f.edadRecomendada || f.edad || '';
      return (
        f.titulo.toLowerCase().includes(texto) ||
        f.producto.toLowerCase().includes(texto) ||
        edad.toLowerCase().includes(texto)
      );
    });
  }

  // Ordenamiento
  if (orden === 'precio-asc') lista.sort((a, b) => Number(a.precio) - Number(b.precio));
  if (orden === 'precio-desc') lista.sort((a, b) => Number(b.precio) - Number(a.precio));
  if (orden === 'recientes') lista.sort((a, b) => Number(b.id) - Number(a.id));

  renderizarCatalogo(lista);
}

function renderizarCatalogo(lista) {
  if (!contenedorFichas) return;

  if (lista.length === 0) {
    contenedorFichas.innerHTML = `
      <div class="alert alert-light border w-100 text-center py-4">
        No se encontraron fichas de recomendación para este criterio.
      </div>`;
    return;
  }

  // Usa cardHTML() definido en common.js pasando boolean si el asesor está autenticado
  contenedorFichas.innerHTML = lista.map((ficha) => cardHTML(ficha, Boolean(asesorActivo))).join('');
}

function actualizarContadorFavoritos() {
  if (favCountEl) favCountEl.textContent = getFavoritos().length;
}

// ==========================================
// 4. EVENTOS DEL DOM Y DELEGACIÓN (Lab 04)
// ==========================================
function inicializarEventos() {
  // 4.1 Filtros, buscador y ordenamiento
  selectCategoria?.addEventListener('change', () => {
    soloFavoritos = false;
    localStorage.setItem('guiapeques_categoria', selectCategoria.value);
    aplicarFiltrosYRenderizar();
  });

  selectOrden?.addEventListener('change', aplicarFiltrosYRenderizar);
  inputBusqueda?.addEventListener('input', aplicarFiltrosYRenderizar);

  document.querySelector('#btn-toggle-favs')?.addEventListener('click', () => {
    soloFavoritos = !soloFavoritos;
    aplicarFiltrosYRenderizar();
document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 4.2 Delegación de clics dentro de la grilla de tarjetas (Favorito, Detalle, Editar, Eliminar)
  contenedorFichas?.addEventListener('click', async (e) => {
    // Botón Favorito (localStorage)
    const btnFav = e.target.closest('[data-fav]');
    if (btnFav) {
      toggleFavoritoStorage(btnFav.dataset.fav);
      actualizarContadorFavoritos();
      aplicarFiltrosYRenderizar();
      return;
    }

    // Botón Ver Detalle
    const btnDetalle = e.target.closest('[data-detalle]');
    if (btnDetalle) {
      mostrarDetalleFicha(Number(btnDetalle.dataset.detalle));
      return;
    }

    // Botón Editar (Abre modal con datos cargados para PUT)
    const btnEditar = e.target.closest('[data-editar]');
    if (btnEditar) {
      prepararEdicionFicha(Number(btnEditar.dataset.editar));
      return;
    }

    // Botón Eliminar (DELETE /api/fichas/:id sin recargar)
    const btnBorrar = e.target.closest('[data-borrar]');
    if (btnBorrar) {
      await eliminarFicha(Number(btnBorrar.dataset.borrar));
    }
  });

  // 4.3 Formulario Login de Asesor (POST /api/auth/login)
  document.querySelector('#form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await api(
        '/api/auth/login',
        'POST',
        {
          email: document.querySelector('#login-email').value.trim(),
          password: document.querySelector('#login-password').value
        },
        { redirigirEn401: false } // Evita reabrir modal si las credenciales son incorrectas
      );

      asesorActivo = res.data;
      cerrarModal('#modalAuth');
      actualizarUIAuth();
      aplicarFiltrosYRenderizar();
      showAlert(alertContainer, `Bienvenido(a), ${asesorActivo.nombre}. Modo edición activado.`, 'success');
    } catch (err) {
      showAlert(alertContainer, err.message, 'danger');
    }
  });

  // 4.4 Formulario Registro de Asesor (POST /api/auth/register)
  document.querySelector('#form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api(
        '/api/auth/register',
        'POST',
        {
          nombre: document.querySelector('#reg-nombre').value.trim(),
          email: document.querySelector('#reg-email').value.trim(),
          password: document.querySelector('#reg-password').value
        },
        { redirigirEn401: false }
      );
      e.target.reset();
      showAlert(alertContainer, 'Asesor registrado con contraseña cifrada (bcrypt). Ya puede iniciar sesión.', 'success');
    } catch (err) {
      showAlert(alertContainer, err.message, 'danger');
    }
  });

  // 4.5 Cerrar Sesión (POST /api/auth/logout)
  document.querySelector('#btn-logout')?.addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', 'POST', null, { redirigirEn401: false });
    } finally {
      asesorActivo = null;
      actualizarUIAuth();
      aplicarFiltrosYRenderizar();
      showAlert(alertContainer, 'Sesión cerrada correctamente.', 'info');
    }
  });

  // 4.6 Preparar Modal para Nueva Ficha
  document.querySelector('#btn-nueva-ficha')?.addEventListener('click', () => {
    const form = document.querySelector('#form-ficha');
    form?.reset();
    document.querySelector('#ficha-id').value = '';
    document.querySelector('#modalFichaTitulo').textContent = 'Publicar Ficha de Recomendación';
  });

  // 4.7 Guardar Ficha: Crear (POST) o Actualizar (PUT) sin recargar
  document.querySelector('#form-ficha')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.querySelector('#ficha-id').value;
    const payload = {
      categoria: document.querySelector('#ficha-categoria').value,
      producto: document.querySelector('#ficha-producto').value.trim(),
      titulo: document.querySelector('#ficha-titulo').value.trim(),
      precio: Number(document.querySelector('#ficha-precio').value),
      edadRecomendada: document.querySelector('#ficha-edad').value.trim(),
      imagen: document.querySelector('#ficha-imagen')?.value.trim() || '',
      descripcion: document.querySelector('#ficha-descripcion').value.trim()
    };

    try {
      if (id) {
        await api(`/api/fichas/${id}`, 'PUT', payload);
        showAlert(alertContainer, 'Ficha actualizada sin recargar la página.', 'success');
      } else {
        await api('/api/fichas', 'POST', payload);
        showAlert(alertContainer, 'Nueva ficha publicada exitosamente.', 'success');
      }

      cerrarModal('#modalFicha');
      await cargarFichas();
    } catch (err) {
      if (err.status === 401) {
        asesorActivo = null;
        actualizarUIAuth();
        aplicarFiltrosYRenderizar();
        cerrarModal('#modalFicha');
      }
      showAlert(alertContainer, err.message, 'danger');
    }
  });
}

// ==========================================
// 5. ACCIONES AUXILIARES DE TARJETAS
// ==========================================
function mostrarDetalleFicha(id) {
  const f = todasLasFichas.find((item) => Number(item.id) === id);
  if (!f) return;

  const edadTexto = f.edadRecomendada || f.edad || 'Todas las etapas';
  const imgUrl = f.imagen || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80';

  document.querySelector('#modalDetalleBody').innerHTML = `
    <div class="modal-header">
      <h5 class="modal-title font-serif fw-bold">${esc(f.titulo)}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
    </div>
    <div class="modal-body">
      <img src="${esc(imgUrl)}" class="img-fluid rounded mb-3 w-100" style="max-height: 240px; object-fit: cover;" alt="${esc(f.producto)}" />
      <p class="mb-1"><strong>Producto:</strong> ${esc(f.producto)}</p>
      <p class="mb-1"><strong>Categoría:</strong> ${esc(nombreCategoria(f.categoria))}</p>
      <p class="mb-1"><strong>Edad recomendada:</strong> ${esc(edadTexto)}</p>
      <p class="mb-3"><strong>Precio aproximado:</strong> <span class="text-success fw-bold">S/ ${Number(f.precio).toFixed(2)}</span></p>
      <div class="bg-light p-3 rounded small text-secondary">${esc(f.descripcion || 'Sin descripción adicional.')}</div>
    </div>`;
  abrirModal('#modalDetalle');
}

function prepararEdicionFicha(id) {
  const f = todasLasFichas.find((item) => Number(item.id) === id);
  if (!f) return;

  document.querySelector('#ficha-id').value = f.id;
  document.querySelector('#ficha-categoria').value = nombreCategoria(f.categoria);
  document.querySelector('#ficha-producto').value = f.producto;
  document.querySelector('#ficha-titulo').value = f.titulo;
  document.querySelector('#ficha-precio').value = f.precio;
  document.querySelector('#ficha-edad').value = f.edadRecomendada || f.edad || '';
  if (document.querySelector('#ficha-imagen')) {
    document.querySelector('#ficha-imagen').value = f.imagen || '';
  }
  document.querySelector('#ficha-descripcion').value = f.descripcion || '';
  document.querySelector('#modalFichaTitulo').textContent = `Editar Ficha #${f.id}`;

  abrirModal('#modalFicha');
}

async function eliminarFicha(id) {
  if (!confirm('¿Desea eliminar esta ficha de recomendación?')) return;

  try {
    await api(`/api/fichas/${id}`, 'DELETE');
    await cargarFichas();
    showAlert(alertContainer, 'Ficha eliminada del sistema.', 'warning');
  } catch (err) {
    if (err.status === 401) {
      asesorActivo = null;
      actualizarUIAuth();
      aplicarFiltrosYRenderizar();
    }
    showAlert(alertContainer, err.message, 'danger');
  }
}


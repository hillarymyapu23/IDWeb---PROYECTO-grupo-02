// Utilidades compartidas por todas las páginas. Todo cuelga de window.PP para no ensuciar el ámbito global.
(function () {
  const PP = (window.PP = {});

  // ---------- Seguridad: escapar todo texto que viene del servidor antes de ponerlo en el HTML ----------
  PP.esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  PP.precio = (n) => 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  PP.fecha = (iso) => new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

  // ---------- Llamadas a la API ----------
  PP.api = async (url, opciones = {}) => {
    const cfg = { method: 'GET', credentials: 'same-origin', headers: {}, ...opciones };
    if (cfg.body && typeof cfg.body !== 'string') {
      cfg.body = JSON.stringify(cfg.body);
      cfg.headers['Content-Type'] = 'application/json';
    }
    try {
      const r = await fetch(url, cfg);
      let json = {};
      try { json = await r.json(); } catch (e) { /* respuesta sin cuerpo */ }
      return { ok: r.ok, status: r.status, json };
    } catch (e) {
      return { ok: false, status: 0, json: { message: 'No se pudo conectar con el servidor. Revisa tu conexión.' } };
    }
  };

  let metaPromesa = null;
  PP.meta = () => {
    if (!metaPromesa) {
      metaPromesa = PP.api('/api/meta').then((r) => (r.ok ? r.json.data : { categorias: [], etapas: [], asuntos: [] }));
    }
    return metaPromesa;
  };

  // ---------- localStorage con try/catch (puede estar bloqueado en modo privado) ----------
  const leer = (clave) => {
    try {
      const v = JSON.parse(localStorage.getItem(clave) || '[]');
      return Array.isArray(v) ? v.filter(Number.isInteger) : [];
    } catch (e) { return []; }
  };
  const guardar = (clave, valor) => {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
  };
  PP.favoritos = {
    todos: () => leer('pp_favoritos'),
    tiene: (id) => leer('pp_favoritos').includes(id),
    alternar(id) {
      const l = leer('pp_favoritos');
      const i = l.indexOf(id);
      if (i === -1) l.push(id); else l.splice(i, 1);
      guardar('pp_favoritos', l);
      return i === -1;
    },
  };
  PP.comparar = {
    MAX: 3,
    todos: () => leer('pp_comparar'),
    tiene: (id) => leer('pp_comparar').includes(id),
    alternar(id) {
      const l = leer('pp_comparar');
      const i = l.indexOf(id);
      if (i !== -1) { l.splice(i, 1); guardar('pp_comparar', l); return { activo: false }; }
      if (l.length >= PP.comparar.MAX) return { activo: false, lleno: true };
      l.push(id);
      guardar('pp_comparar', l);
      return { activo: true };
    },
    vaciar: () => guardar('pp_comparar', []),
  };

  // ---------- Iconos SVG en línea (sin librerías externas) ----------
  PP.icono = (nombre) => {
    const base = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const rutas = {
      corazon: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
      balanza: '<path d="M12 3v18M5 21h14M5 7h14M5 7l-3 7a3.500 3.500 0 0 0 6 0L5 7zm14 0l-3 7a3.500 3.500 0 0 0 6 0l-3-7z"/>',
      buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/>',
      usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.500-6 8-6s8 2 8 6"/>',
      escudo: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
      ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    };
    return `<svg ${base}>${rutas[nombre] || ''}</svg>`;
  };

  // ---------- Avisos (toast de Bootstrap) ----------
  PP.aviso = (mensaje, tipo = 'ok') => {
    let cont = document.getElementById('avisos');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'avisos';
      cont.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      cont.setAttribute('aria-live', 'polite');
      document.body.appendChild(cont);
    }
    const el = document.createElement('div');
    el.className = 'toast align-items-center border-0 aviso aviso-' + tipo;
    el.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    el.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar aviso"></button></div>';
    el.querySelector('.toast-body').textContent = mensaje;
    cont.appendChild(el);
    const t = new bootstrap.Toast(el, { delay: 4000 });
    el.addEventListener('hidden.bs.toast', () => el.remove());
    t.show();
  };

  // ---------- Tarjeta de ficha ----------
  PP.cache = new Map(); // id -> ficha, para abrir el detalle sin volver a pedirla
  PP.meta_ = { categorias: [], etapas: [] };

  const nombreCat = (slug) => (PP.meta_.categorias.find((c) => c.slug === slug) || {}).corto || slug;
  const nombreEtapa = (slug) => (PP.meta_.etapas.find((e) => e.slug === slug) || {}).nombre || slug;
  const imgCat = (slug) => (PP.meta_.categorias.find((c) => c.slug === slug) || {}).imagen || 'img/favicon.svg';
  PP.nombreCat = nombreCat;
  PP.nombreEtapa = nombreEtapa;

  PP.tarjeta = (f) => {
    PP.cache.set(f.id, f);
    const fav = PP.favoritos.tiene(f.id);
    const cmp = PP.comparar.tiene(f.id);
    return `
    <div class="col">
      <article class="ficha card h-100" data-id="${f.id}">
        <div class="ficha-img"><img src="${PP.esc(imgCat(f.categoria))}" alt="" loading="lazy" width="400" height="300">
          <button type="button" class="btn-fav" data-accion="fav" data-id="${f.id}" aria-pressed="${fav}" aria-label="${fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}: ${PP.esc(f.titulo)}">${PP.icono('corazon')}</button>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="mb-2"><span class="badge etiqueta-cat">${PP.esc(nombreCat(f.categoria))}</span> <span class="badge etiqueta-etapa">${PP.esc(nombreEtapa(f.etapa))}</span></div>
          <h3 class="h6 ficha-titulo">${PP.esc(f.titulo)}</h3>
          <p class="small text-muted mb-2">${PP.esc(f.edad)}</p>
          <p class="ficha-precio mt-auto mb-3">${PP.precio(f.precio)} <span class="small text-muted fw-normal">aprox.</span></p>
          <div class="d-flex gap-2 align-items-center">
            <button type="button" class="btn btn-sm btn-principal flex-grow-1" data-accion="detalle" data-id="${f.id}">Ver guía</button>
            <button type="button" class="btn btn-sm btn-outline-secundario" data-accion="comparar" data-id="${f.id}" aria-pressed="${cmp}" title="Comparar">${PP.icono('balanza')}<span class="visually-hidden">${cmp ? 'Quitar de la comparación' : 'Agregar a la comparación'}: ${PP.esc(f.titulo)}</span></button>
          </div>
        </div>
      </article>
    </div>`;
  };

  // ---------- Detalle en ventana modal ----------
  function modalGenerico() {
    let m = document.getElementById('modal-pp');
    if (!m) {
      m = document.createElement('div');
      m.className = 'modal fade';
      m.id = 'modal-pp';
      m.tabIndex = -1;
      m.setAttribute('aria-labelledby', 'modal-pp-titulo');
      m.setAttribute('aria-hidden', 'true');
      m.innerHTML = '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"><div class="modal-content"><div class="modal-header"><h2 class="modal-title h5" id="modal-pp-titulo"></h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div><div class="modal-body"></div><div class="modal-footer"></div></div></div>';
      document.body.appendChild(m);
    }
    return m;
  }
  function mostrarModal(titulo, cuerpo, pie) {
    const m = modalGenerico();
    m.querySelector('.modal-title').textContent = titulo;
    m.querySelector('.modal-body').innerHTML = cuerpo;
    m.querySelector('.modal-footer').innerHTML = pie || '<button type="button" class="btn btn-outline-secundario" data-bs-dismiss="modal">Cerrar</button>';
    bootstrap.Modal.getOrCreateInstance(m).show();
  }

  function abrirDetalle(id) {
    const f = PP.cache.get(id);
    if (!f) return;
    const cat = PP.meta_.categorias.find((c) => c.slug === f.categoria) || { queMirar: [], seguridad: [] };
    const cuerpo = `
      <div class="row g-4">
        <div class="col-md-5"><img class="img-fluid rounded-4" src="${PP.esc(imgCat(f.categoria))}" alt="Ilustración de ${PP.esc(nombreCat(f.categoria))}"></div>
        <div class="col-md-7">
          <p class="mb-2"><span class="badge etiqueta-cat">${PP.esc(nombreCat(f.categoria))}</span> <span class="badge etiqueta-etapa">${PP.esc(nombreEtapa(f.etapa))}</span></p>
          <p class="fw-semibold mb-1">${PP.esc(f.producto)}</p>
          <p class="ficha-precio mb-2">${PP.precio(f.precio)} <span class="small text-muted fw-normal">precio referencial</span></p>
          <p class="mb-2"><strong>Edad recomendada:</strong> ${PP.esc(f.edad)}</p>
          <p>${PP.esc(f.descripcion)}</p>
          <p class="small text-muted mb-0">Recomendado por ${PP.esc(f.asesor || 'Equipo Primeros Pasos')}</p>
        </div>
      </div>
      <hr>
      <div class="row g-4">
        <div class="col-md-6"><h3 class="h6">Qué mirar antes de comprar</h3><ul class="small mb-0">${(cat.queMirar || []).map((x) => `<li>${PP.esc(x)}</li>`).join('')}</ul></div>
        <div class="col-md-6"><h3 class="h6">Seguridad</h3><ul class="small mb-0">${(cat.seguridad || []).map((s) => `<li><strong>${PP.esc(s.titulo)}.</strong> ${PP.esc(s.texto)}</li>`).join('')}</ul></div>
      </div>`;
    const pie = `<button type="button" class="btn btn-outline-secundario" data-accion="fav" data-id="${f.id}" aria-pressed="${PP.favoritos.tiene(f.id)}">${PP.icono('corazon')} <span class="txt-fav">${PP.favoritos.tiene(f.id) ? 'Guardada' : 'Guardar'}</span></button><button type="button" class="btn btn-principal" data-bs-dismiss="modal">Cerrar</button>`;
    mostrarModal(f.titulo, cuerpo, pie);
  }

  async function abrirComparacion() {
    const ids = PP.comparar.todos();
    if (ids.length < 2) { PP.aviso('Elige al menos 2 guías para compararlas.', 'error'); return; }
    const r = await PP.api('/api/fichas?ids=' + ids.join(','));
    if (!r.ok) { PP.aviso('No se pudo cargar la comparación.', 'error'); return; }
    const fs = r.json.data;
    const filas = [
      ['Categoría', (f) => nombreCat(f.categoria)],
      ['Etapa', (f) => nombreEtapa(f.etapa)],
      ['Producto', (f) => f.producto],
      ['Precio', (f) => PP.precio(f.precio)],
      ['Edad', (f) => f.edad],
      ['Resumen', (f) => f.descripcion],
    ];
    const cuerpo = `<div class="table-responsive"><table class="table table-sm align-top tabla-comparar"><thead><tr><th scope="col"><span class="visually-hidden">Dato</span></th>${fs.map((f) => `<th scope="col">${PP.esc(f.titulo)}</th>`).join('')}</tr></thead><tbody>${filas.map(([n, fn]) => `<tr><th scope="row">${n}</th>${fs.map((f) => `<td>${PP.esc(fn(f))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    mostrarModal('Comparar guías', cuerpo);
  }

  // ---------- Barra de comparación ----------
  PP.actualizarBarra = () => {
    let b = document.getElementById('barra-comparar');
    const n = PP.comparar.todos().length;
    if (!n) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('div');
      b.id = 'barra-comparar';
      b.className = 'barra-comparar';
      b.setAttribute('role', 'region');
      b.setAttribute('aria-label', 'Comparación de guías');
      document.body.appendChild(b);
    }
    b.innerHTML = `<span><strong>${n}</strong> ${n === 1 ? 'guía elegida' : 'guías elegidas'} (máximo ${PP.comparar.MAX})</span>
      <span class="d-flex gap-2"><button type="button" class="btn btn-sm btn-principal" data-accion="abrir-comparar" ${n < 2 ? 'disabled' : ''}>Comparar</button><button type="button" class="btn btn-sm btn-outline-secundario" data-accion="vaciar-comparar">Vaciar</button></span>`;
  };

  PP.actualizarContadorFav = () => {
    const n = PP.favoritos.todos().length;
    document.querySelectorAll('[data-contador-fav]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  };

  function refrescarBotones(id) {
    document.querySelectorAll(`[data-accion="fav"][data-id="${id}"]`).forEach((b) => {
      const on = PP.favoritos.tiene(id);
      b.setAttribute('aria-pressed', on);
      const t = b.querySelector('.txt-fav');
      if (t) t.textContent = on ? 'Guardada' : 'Guardar';
      else b.setAttribute('aria-label', (on ? 'Quitar de favoritos' : 'Guardar en favoritos') + ': ' + ((PP.cache.get(id) || {}).titulo || ''));
    });
    document.querySelectorAll(`[data-accion="comparar"][data-id="${id}"]`).forEach((b) => b.setAttribute('aria-pressed', PP.comparar.tiene(id)));
  }

  // ---------- Un solo manejador de clics para toda la página (delegación de eventos) ----------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-accion]');
    if (!el) return;
    const id = Number(el.dataset.id);
    switch (el.dataset.accion) {
      case 'fav': {
        const activo = PP.favoritos.alternar(id);
        refrescarBotones(id);
        PP.actualizarContadorFav();
        PP.aviso(activo ? 'Guardada en tus favoritos.' : 'Quitada de tus favoritos.');
        document.dispatchEvent(new CustomEvent('pp:favoritos', { detail: { id, activo } }));
        break;
      }
      case 'comparar': {
        const r = PP.comparar.alternar(id);
        if (r.lleno) PP.aviso(`Puedes comparar hasta ${PP.comparar.MAX} guías a la vez.`, 'error');
        refrescarBotones(id);
        PP.actualizarBarra();
        break;
      }
      case 'detalle': abrirDetalle(id); break;
      case 'abrir-comparar': abrirComparacion(); break;
      case 'vaciar-comparar':
        PP.comparar.todos().forEach((x) => PP.comparar.alternar(x));
        document.querySelectorAll('[data-accion="comparar"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        PP.actualizarBarra();
        break;
      default:
    }
  });

  PP.cargarMetaGlobal = async () => { PP.meta_ = await PP.meta(); return PP.meta_; };
})();

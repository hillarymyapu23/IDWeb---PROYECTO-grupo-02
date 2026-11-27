// Listado de guías: búsqueda, filtros, orden y favoritos. Los filtros viven en la URL para poder compartir el enlace.
(async function () {
  const { esc } = PP;
  const meta = await PP.cargarMetaGlobal();
  const f = document.getElementById('filtros');
  const lista = document.getElementById('lista');
  const vacio = document.getElementById('vacio');
  const conteo = document.getElementById('conteo');
  const campos = { q: f.q, c: f.c, etapa: f.etapa, orden: f.orden };

  f.c.insertAdjacentHTML('beforeend', meta.categorias.map((c) => `<option value="${esc(c.slug)}">${esc(c.corto)}</option>`).join(''));
  f.etapa.insertAdjacentHTML('beforeend', meta.etapas.map((e) => `<option value="${esc(e.slug)}">${esc(e.nombre)} (${esc(e.rango)})</option>`).join(''));

  // Estado inicial desde la URL
  const url = new URLSearchParams(location.search);
  f.q.value = (url.get('q') || '').slice(0, 60);
  if (meta.categorias.some((c) => c.slug === url.get('c'))) f.c.value = url.get('c');
  if (meta.etapas.some((e) => e.slug === url.get('etapa'))) f.etapa.value = url.get('etapa');
  if (['precio-asc', 'precio-desc'].includes(url.get('orden'))) f.orden.value = url.get('orden');
  f.fav.checked = url.get('fav') === '1';

  let turno = 0;
  async function cargar() {
    const params = new URLSearchParams();
    if (f.q.value.trim()) params.set('q', f.q.value.trim());
    if (f.c.value) params.set('c', f.c.value);
    if (f.etapa.value) params.set('etapa', f.etapa.value);
    if (f.orden.value) params.set('orden', f.orden.value);
    if (f.fav.checked) params.set('fav', '1');
    history.replaceState(null, '', params.toString() ? '?' + params : location.pathname);

    const api = new URLSearchParams();
    if (f.q.value.trim()) api.set('q', f.q.value.trim());
    if (f.c.value) api.set('categoria', f.c.value);
    if (f.etapa.value) api.set('etapa', f.etapa.value);
    if (f.orden.value) api.set('orden', f.orden.value);

    let datos = [];
    const yo = ++turno;
    if (f.fav.checked) {
      const ids = PP.favoritos.todos();
      if (ids.length) {
        api.set('ids', ids.join(','));
        const r = await PP.api('/api/fichas?' + api);
        datos = r.ok ? r.json.data : [];
      }
    } else {
      const r = await PP.api('/api/fichas?' + api);
      if (!r.ok) { conteo.textContent = r.json.message || 'No se pudieron cargar las guías.'; return; }
      datos = r.json.data;
    }
    if (yo !== turno) return; // llegó una respuesta más vieja que otra ya pedida

    lista.innerHTML = datos.map(PP.tarjeta).join('');
    conteo.textContent = datos.length === 1 ? '1 guía encontrada' : `${datos.length} guías encontradas`;
    vacio.hidden = datos.length > 0;
    if (!datos.length) {
      vacio.innerHTML = f.fav.checked
        ? '<p class="mb-2">Aún no guardaste favoritos.</p><p class="small text-muted mb-0">Toca el corazón de una guía para guardarla aquí.</p>'
        : '<p class="mb-2">No encontramos guías con esos filtros.</p><p class="small text-muted mb-0">Prueba con otra palabra o quita algún filtro.</p>';
    }
  }

  let espera;
  f.q.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 250); });
  [f.c, f.etapa, f.orden, f.fav].forEach((el) => el.addEventListener('change', cargar));
  f.addEventListener('submit', (e) => { e.preventDefault(); cargar(); });
  document.getElementById('limpiar').addEventListener('click', () => {
    f.reset(); f.fav.checked = false; cargar();
  });
  document.addEventListener('pp:favoritos', () => { if (f.fav.checked) cargar(); });
  cargar();
})();

// Panel de asesores: crear, editar y eliminar guías propias, y leer los mensajes de contacto.
(async function () {
  const { esc } = PP;
  const irALogin = () => location.replace('login.html?expirada=1');

  // Llamadas protegidas: si el servidor responde 401 la sesión terminó y se manda al login.
  async function protegida(url, op) {
    const r = await PP.api(url, op);
    if (r.status === 401) { irALogin(); return new Promise(() => {}); }
    return r;
  }

  const perfil = await protegida('/api/perfil');
  document.getElementById('saludo').textContent = 'Hola, ' + perfil.json.data.nombre + '. Aquí gestionas tus guías.';
  const meta = await PP.cargarMetaGlobal();

  const f = document.getElementById('form-ficha');
  const msg = document.getElementById('msg-ficha');
  f.categoria.insertAdjacentHTML('beforeend', meta.categorias.map((c) => `<option value="${esc(c.slug)}">${esc(c.corto)}</option>`).join(''));
  f.etapa.insertAdjacentHTML('beforeend', meta.etapas.map((e) => `<option value="${esc(e.slug)}">${esc(e.nombre)}</option>`).join(''));

  const aviso = (texto, tipo) => { msg.textContent = texto; msg.className = 'alert alert-' + tipo; };
  const campos = ['categoria', 'etapa', 'titulo', 'producto', 'precio', 'edad', 'descripcion'];

  function modoNueva() {
    f.reset(); f['ficha-id'].value = '';
    document.getElementById('form-titulo').textContent = 'Nueva guía';
    document.getElementById('guardar').textContent = 'Publicar guía';
    document.getElementById('cancelar').classList.add('d-none');
    f.classList.remove('was-validated');
  }
  function modoEditar(x) {
    campos.forEach((c) => { f[c].value = x[c]; });
    f['ficha-id'].value = x.id;
    document.getElementById('form-titulo').textContent = 'Editar guía';
    document.getElementById('guardar').textContent = 'Guardar cambios';
    document.getElementById('cancelar').classList.remove('d-none');
    msg.className = 'alert d-none';
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    f.titulo.focus();
  }

  let mias = [];
  async function cargarMias() {
    const r = await protegida('/api/fichas/mias');
    mias = r.json.data || [];
    const cont = document.getElementById('mis-fichas');
    cont.innerHTML = mias.length ? mias.map((x) => `
      <article class="card p-3 ficha">
        <div class="d-flex justify-content-between gap-3">
          <div><h3 class="h6 mb-1 ficha-titulo">${esc(x.titulo)}</h3>
            <p class="small text-muted mb-1">${esc(PP.nombreCat(x.categoria))} · ${esc(PP.nombreEtapa(x.etapa))} · ${PP.precio(x.precio)}</p></div>
          <div class="d-flex gap-2 flex-none align-items-start">
            <button type="button" class="btn btn-sm btn-outline-secundario" data-panel="editar" data-id="${x.id}" aria-label="Editar: ${esc(x.titulo)}">Editar</button>
            <button type="button" class="btn btn-sm btn-outline-secundario" data-panel="borrar" data-id="${x.id}" aria-label="Eliminar: ${esc(x.titulo)}">Eliminar</button>
          </div>
        </div>
      </article>`).join('')
      : '<div class="vacio"><p class="mb-1">Aún no publicaste guías.</p><p class="small text-muted mb-0">Completa el formulario para publicar la primera.</p></div>';
  }

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    f.classList.add('was-validated');
    if (!f.checkValidity()) { aviso('Revisa los campos marcados.', 'danger'); f.querySelector(':invalid').focus(); return; }
    const id = f['ficha-id'].value;
    const cuerpo = {};
    campos.forEach((c) => { cuerpo[c] = f[c].value; });
    cuerpo.precio = Number(cuerpo.precio);
    const r = await protegida(id ? '/api/fichas/' + id : '/api/fichas', { method: id ? 'PUT' : 'POST', body: cuerpo });
    if (!r.ok) return aviso(r.json.message || 'No se pudo guardar.', 'danger');
    PP.aviso(id ? 'Cambios guardados.' : 'Guía publicada.');
    modoNueva(); msg.className = 'alert d-none';
    cargarMias();
  });
  document.getElementById('cancelar').addEventListener('click', () => { modoNueva(); msg.className = 'alert d-none'; });

  // Modal de confirmación para eliminar
  let pendiente = null;
  const modal = document.createElement('div');
  modal.className = 'modal fade'; modal.tabIndex = -1; modal.setAttribute('aria-labelledby', 'm-borrar-t'); modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `<div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h2 class="modal-title h5" id="m-borrar-t">Eliminar guía</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div><div class="modal-body"><p class="mb-0">¿Seguro que quieres eliminar “<span id="m-borrar-n"></span>”? No se puede deshacer.</p></div><div class="modal-footer"><button type="button" class="btn btn-outline-secundario" data-bs-dismiss="modal">Cancelar</button><button type="button" class="btn btn-principal" id="m-borrar-ok">Sí, eliminar</button></div></div></div>`;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);

  document.getElementById('mis-fichas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-panel]');
    if (!b) return;
    const x = mias.find((m) => m.id === Number(b.dataset.id));
    if (!x) return;
    if (b.dataset.panel === 'editar') modoEditar(x);
    else { pendiente = x; document.getElementById('m-borrar-n').textContent = x.titulo; bsModal.show(); }
  });
  document.getElementById('m-borrar-ok').addEventListener('click', async () => {
    if (!pendiente) return;
    const r = await protegida('/api/fichas/' + pendiente.id, { method: 'DELETE' });
    bsModal.hide();
    if (r.ok) { PP.aviso('Guía eliminada.'); if (f['ficha-id'].value === String(pendiente.id)) modoNueva(); cargarMias(); }
    else PP.aviso(r.json.message || 'No se pudo eliminar.', 'error');
    pendiente = null;
  });

  // Mensajes de contacto
  async function cargarMensajes() {
    const r = await protegida('/api/contacto');
    const lista = r.json.data || [];
    document.getElementById('n-mensajes').textContent = lista.length;
    const asunto = (s) => (meta.asuntos.find((a) => a.slug === s) || {}).nombre || s;
    document.getElementById('mensajes').innerHTML = lista.length ? lista.map((m) => `
      <article class="card p-3 ficha"><div class="d-flex justify-content-between gap-3">
        <div><h3 class="h6 mb-1">${esc(asunto(m.asunto))}</h3><p class="small text-muted mb-2">${esc(m.nombre)} · <a href="mailto:${esc(m.email)}">${esc(m.email)}</a> · ${PP.fecha(m.fecha)}</p><p class="mb-0">${esc(m.mensaje)}</p></div>
        <button type="button" class="btn btn-sm btn-outline-secundario align-self-start" data-msg="${m.id}" aria-label="Eliminar mensaje de ${esc(m.nombre)}">Eliminar</button>
      </div></article>`).join('')
      : '<div class="vacio"><p class="mb-0">No hay mensajes por ahora.</p></div>';
  }
  document.getElementById('mensajes').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-msg]');
    if (!b) return;
    const r = await protegida('/api/contacto/' + b.dataset.msg, { method: 'DELETE' });
    if (r.ok) { PP.aviso('Mensaje eliminado.'); cargarMensajes(); }
  });

  document.getElementById('salir').addEventListener('click', async () => {
    await PP.api('/api/auth/logout', { method: 'POST' });
    location.href = 'index.html';
  });

  cargarMias(); cargarMensajes();
})();

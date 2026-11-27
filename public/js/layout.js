// Dibuja el menú superior y el pie de página en todas las páginas (así se editan en un solo lugar).
(function () {
  const { esc, icono } = PP;
  const pagina = location.pathname.split('/').pop() || 'index.html';
  const actual = (archivos) => (archivos.includes(pagina) ? ' aria-current="page"' : '');

  function cabecera(meta, sesion) {
    const cats = meta.categorias
      .map(
        (c) => `<li><a class="dropdown-item item-cat" href="categoria.html?c=${esc(c.slug)}">
          <img src="${esc(c.imagen)}" alt="" width="56" height="42"><span><strong>${esc(c.corto)}</strong><small>${esc(c.resumen.split('.')[0])}.</small></span></a></li>`
      )
      .join('');
    const etapas = meta.etapas
      .map((e) => `<li><a class="dropdown-item" href="guias.html?etapa=${esc(e.slug)}"><strong>${esc(e.nombre)}</strong> <small class="text-muted">${esc(e.rango)}</small></a></li>`)
      .join('');
    const cuenta = sesion
      ? `<a class="btn btn-sm btn-principal" href="panel.html"${actual(['panel.html'])}>${icono('usuario')} Mi panel</a>`
      : `<a class="btn btn-sm btn-outline-secundario" href="login.html"${actual(['login.html'])}>${icono('usuario')} Soy asesor</a>`;

    return `
    <a class="saltar" href="#contenido">Saltar al contenido</a>
    <div class="promo" role="region" aria-label="Aviso del portal"><div class="container">Guías de compra hechas por estudiantes para padres primerizos. Los precios son referenciales.</div></div>
    <header class="cabecera">
      <nav class="navbar navbar-expand-lg" aria-label="Menú principal">
        <div class="container">
          <a class="navbar-brand marca" href="index.html"><img src="img/favicon.svg" alt="" width="34" height="34"> Primeros Pasos</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu" aria-controls="menu" aria-expanded="false" aria-label="Abrir menú"><span class="navbar-toggler-icon"></span></button>
          <div class="collapse navbar-collapse" id="menu">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item dropdown mega">
                <a class="nav-link dropdown-toggle" href="guias.html" role="button" data-bs-toggle="dropdown" aria-expanded="false">Categorías</a>
                <ul class="dropdown-menu mega-menu">${cats}<li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="guias.html">Ver todas las guías</a></li></ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="guias.html" role="button" data-bs-toggle="dropdown" aria-expanded="false">Por etapa</a>
                <ul class="dropdown-menu">${etapas}</ul>
              </li>
              <li class="nav-item"><a class="nav-link" href="guias.html?c=coches-bebe&amp;q=accesorio">Accesorios</a></li>
              <li class="nav-item"><a class="nav-link"${actual(['nosotros.html'])} href="nosotros.html">Nosotros</a></li>
              <li class="nav-item"><a class="nav-link"${actual(['contacto.html'])} href="contacto.html">Contacto</a></li>
            </ul>
            <form class="buscador d-flex" role="search" aria-label="Buscar en el portal" action="guias.html" method="get">
              <label class="visually-hidden" for="buscar-menu">Buscar guías</label>
              <input id="buscar-menu" class="form-control form-control-sm" type="search" name="q" placeholder="Buscar: cuna, coche, asiento…" maxlength="60" autocomplete="off">
              <button class="btn btn-sm btn-principal" type="submit" aria-label="Buscar">${icono('buscar')}</button>
            </form>
            <div class="d-flex align-items-center gap-2 mt-3 mt-lg-0 ms-lg-3">
              <a class="btn btn-sm btn-fav-menu" href="guias.html?fav=1" aria-label="Mis favoritos">${icono('corazon')} <span class="badge rounded-pill contador" data-contador-fav hidden>0</span></a>
              ${cuenta}
            </div>
          </div>
        </div>
      </nav>
    </header>`;
  }

  function pie(meta) {
    const cats = meta.categorias.map((c) => `<li><a href="categoria.html?c=${esc(c.slug)}">${esc(c.corto)}</a></li>`).join('');
    return `
    <footer class="pie">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <p class="marca mb-2"><img src="img/favicon.svg" alt="" width="30" height="30"> Primeros Pasos</p>
            <p class="small mb-0">Guías claras para elegir con calma lo que tu bebé necesita: seguridad primero, precio después.</p>
          </div>
          <div class="col-6 col-lg-3"><h2 class="h6">Categorías</h2><ul class="list-unstyled small">${cats}</ul></div>
          <div class="col-6 col-lg-2"><h2 class="h6">El portal</h2><ul class="list-unstyled small"><li><a href="guias.html">Todas las guías</a></li><li><a href="nosotros.html">Nosotros</a></li><li><a href="contacto.html">Contacto</a></li><li><a href="login.html">Acceso de asesores</a></li></ul></div>
          <div class="col-lg-3"><h2 class="h6">Importante</h2><p class="small mb-0">Las guías orientan, pero no reemplazan el manual del fabricante ni la consulta con tu pediatra.</p></div>
        </div>
        <hr>
        <p class="small mb-0">Proyecto académico · Introducción al Desarrollo Web · UNSA · © ${new Date().getFullYear()} Equipo Primeros Pasos</p>
      </div>
    </footer>`;
  }

  async function iniciar() {
    const [meta, ses] = await Promise.all([PP.cargarMetaGlobal(), PP.api('/api/auth/sesion')]);
    const sesion = ses.ok && ses.json.data && ses.json.data.autenticado;
    const c = document.getElementById('cabecera');
    const p = document.getElementById('pie');
    if (c) c.innerHTML = cabecera(meta, sesion);
    if (p) p.innerHTML = pie(meta);
    PP.actualizarContadorFav();
    PP.actualizarBarra();
    document.dispatchEvent(new CustomEvent('pp:listo'));
  }
  PP.listo = iniciar();
})();

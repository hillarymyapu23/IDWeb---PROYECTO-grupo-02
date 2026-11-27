// Portada: carrusel, categorías, etapas y guías recientes (todo sale de /api/meta y /api/fichas).
(async function () {
  const { esc } = PP;
  const meta = await PP.cargarMetaGlobal();

  // Carrusel de categorías
  const slides = document.getElementById('carrusel-slides');
  const puntos = document.getElementById('carrusel-puntos');
  slides.innerHTML = meta.categorias.map((c, i) => `
    <div class="carousel-item${i === 0 ? ' active' : ''}">
      <img src="${esc(c.imagen)}" alt="${esc(c.alt)}" width="800" height="600">
      <div class="carousel-caption"><a href="categoria.html?c=${esc(c.slug)}">${esc(c.nombre)}</a><p class="mb-0 small">${esc(c.resumen.split('.')[0])}.</p></div>
    </div>`).join('');
  puntos.innerHTML = meta.categorias.map((c, i) =>
    `<button type="button" data-bs-target="#carrusel" data-bs-slide-to="${i}"${i === 0 ? ' class="active" aria-current="true"' : ''} aria-label="${esc(c.corto)}"></button>`).join('');
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  new bootstrap.Carousel(document.getElementById('carrusel'), { interval: quieto ? false : 6000, ride: quieto ? false : 'carousel' });

  // Categorías
  document.getElementById('categorias').innerHTML = meta.categorias.map((c) => `
    <div class="col"><a class="cat-tile" href="categoria.html?c=${esc(c.slug)}"><img src="${esc(c.imagen)}" alt="" loading="lazy" width="400" height="300"><span>${esc(c.corto)}</span></a></div>`).join('');

  // Etapas
  document.getElementById('etapas').innerHTML = meta.etapas.map((e) => `
    <li><a href="guias.html?etapa=${esc(e.slug)}"><span class="rango">${esc(e.rango)}</span><strong>${esc(e.nombre)}</strong></a></li>`).join('');

  // Recientes
  const r = await PP.api('/api/fichas?limit=6');
  const cont = document.getElementById('recientes');
  cont.innerHTML = r.ok && r.json.data.length
    ? r.json.data.map(PP.tarjeta).join('')
    : '<p class="text-muted">Aún no hay guías publicadas.</p>';
})();

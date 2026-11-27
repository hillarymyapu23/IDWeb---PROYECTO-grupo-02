// Página de una categoría: /categoria.html?c=<slug>
(async function () {
  const { esc } = PP;
  const meta = await PP.cargarMetaGlobal();
  const slug = new URLSearchParams(location.search).get('c');
  const cat = meta.categorias.find((c) => c.slug === slug);
  const lista = document.getElementById('lista');
  const vacio = document.getElementById('vacio');

  if (!cat) {
    document.getElementById('cat-titulo').textContent = 'Esa categoría no existe';
    document.getElementById('cat-resumen').innerHTML = 'Elige una del menú o <a href="guias.html">mira todas las guías</a>.';
    document.querySelector('.seccion').hidden = true;
    return;
  }
  document.title = cat.nombre + ' | Primeros Pasos';
  document.getElementById('mig').textContent = cat.corto;
  document.getElementById('cat-titulo').textContent = cat.nombre;
  document.getElementById('cat-resumen').textContent = cat.resumen;
  const img = document.getElementById('cat-img');
  img.src = cat.imagen; img.alt = cat.alt; img.hidden = false;

  document.getElementById('cat-mirar').innerHTML = cat.queMirar.map((x) => `<li class="mb-2">${esc(x)}</li>`).join('');
  document.getElementById('cat-seguridad').innerHTML = cat.seguridad.map((s, i) => `
    <div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button${i ? ' collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#s${i}" aria-expanded="${i === 0}" aria-controls="s${i}">${esc(s.titulo)}</button></h3>
    <div id="s${i}" class="accordion-collapse collapse${i === 0 ? ' show' : ''}" data-bs-parent="#cat-seguridad"><div class="accordion-body">${esc(s.texto)}</div></div></div>`).join('');

  const r = await PP.api('/api/fichas?categoria=' + encodeURIComponent(slug));
  const datos = r.ok ? r.json.data : [];
  document.getElementById('cat-total').textContent = datos.length;
  lista.innerHTML = datos.map(PP.tarjeta).join('');
  vacio.hidden = datos.length > 0;
})();

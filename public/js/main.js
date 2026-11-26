const lista = document.querySelector('#lista');
const filtro = document.querySelector('#filtro');

filtro.innerHTML = '<option value="">Todas las categorías</option>' +
  Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');

async function cargar() {
  try {
    const q = filtro.value ? `?categoria=${encodeURIComponent(filtro.value)}` : '';
    const { data } = await api('/api/fichas' + q);
    lista.innerHTML = data.length
      ? data.map(f => cardHTML(f)).join('')
      : '<p class="text-muted">Todavía no hay guías en esta categoría.</p>';
  } catch (err) {
    lista.innerHTML = '<p class="text-danger">No se pudieron cargar las guías.</p>';
  }
}

filtro.addEventListener('change', cargar);
document.addEventListener('DOMContentLoaded', cargar);

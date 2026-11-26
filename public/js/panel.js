const alertas = document.querySelector('#alertas');
const lista = document.querySelector('#lista');
let yo = null; // asesor con sesión

document.querySelector('#categoria').innerHTML =
  '<option value="">Elige una categoría</option>' +
  Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');

async function cargarFichas() {
  const { data } = await api('/api/fichas');
  lista.innerHTML = data.length
    ? data.map(f => cardHTML(f, f.userId === yo.id)).join('')
    : '<p class="text-muted">Aún no hay fichas. Publica la primera.</p>';
}

async function iniciar() {
  try {
    yo = (await api('/api/perfil')).data; // Ruta protegida: sin sesión responde 401
    document.querySelector('#asesor').textContent = yo.email;
    await cargarFichas();
  } catch (err) {
    window.location.href = 'login.html'; // Sin sesión -> al login
  }
}

document.querySelector('#form-ficha').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!e.target.checkValidity()) {
    e.target.classList.add('was-validated');
    return showAlert(alertas, 'Completa todos los campos de la ficha.');
  }
  try {
    await api('/api/fichas', 'POST', {
      categoria: document.querySelector('#categoria').value,
      titulo: document.querySelector('#titulo').value.trim(),
      producto: document.querySelector('#producto').value.trim(),
      precio: document.querySelector('#precio').value,
      edad: document.querySelector('#edad').value.trim()
    });
    e.target.reset();
    e.target.classList.remove('was-validated');
    showAlert(alertas, 'Ficha publicada.', 'success');
    cargarFichas(); // Actualiza las cards sin recargar la página
  } catch (err) { showAlert(alertas, err.message); }
});

// Delegación de eventos: un solo listener para todos los botones "Eliminar"
lista.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-borrar]');
  if (!btn) return;
  try {
    await api(`/api/fichas/${btn.dataset.borrar}`, 'DELETE');
    cargarFichas();
  } catch (err) { showAlert(alertas, err.message); }
});

document.querySelector('#btn-logout').addEventListener('click', async () => {
  await api('/api/auth/logout', 'POST');
  window.location.href = 'index.html';
});

iniciar();

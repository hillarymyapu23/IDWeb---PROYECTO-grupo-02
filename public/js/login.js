// Ingreso y registro de asesores.
(async function () {
  const params = new URLSearchParams(location.search);
  if (params.get('expirada') === '1') document.getElementById('aviso-sesion').hidden = false;

  const ses = await PP.api('/api/auth/sesion');
  if (ses.ok && ses.json.data.autenticado) { location.replace('panel.html'); return; }

  const error = (id, texto) => {
    const el = document.getElementById(id);
    el.textContent = texto;
    el.classList.remove('d-none');
  };

  async function ingresar(email, password, destino) {
    const r = await PP.api('/api/auth/login', { method: 'POST', body: { email, password } });
    if (r.ok) { location.href = 'panel.html'; return; }
    error(destino, r.json.message || 'No se pudo iniciar sesión.');
  }

  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    document.getElementById('msg-login').classList.add('d-none');
    if (!f.email.value || !f.password.value) return error('msg-login', 'Escribe tu correo y tu contraseña.');
    await ingresar(f.email.value.trim(), f.password.value, 'msg-login');
  });

  document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    document.getElementById('msg-registro').classList.add('d-none');
    const datos = { nombre: f.nombre.value.trim(), email: f.email.value.trim(), password: f.password.value };
    const r = await PP.api('/api/auth/register', { method: 'POST', body: datos });
    if (!r.ok) return error('msg-registro', r.json.message || 'No se pudo crear la cuenta.');
    await ingresar(datos.email, datos.password, 'msg-registro');
  });
})();

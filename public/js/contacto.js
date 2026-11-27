// Formulario de contacto (público): valida en el navegador y el servidor vuelve a validar.
(async function () {
  const meta = await PP.cargarMetaGlobal();
  const f = document.getElementById('form-contacto');
  const msg = document.getElementById('msg');
  f.asunto.insertAdjacentHTML('beforeend', meta.asuntos.map((a) => `<option value="${PP.esc(a.slug)}">${PP.esc(a.nombre)}</option>`).join(''));
  const pre = new URLSearchParams(location.search).get('asunto');
  if (meta.asuntos.some((a) => a.slug === pre)) f.asunto.value = pre;

  const cuenta = document.getElementById('cuenta');
  f.mensaje.addEventListener('input', () => { cuenta.textContent = f.mensaje.value.length; });

  const mostrar = (texto, tipo) => {
    msg.textContent = texto;
    msg.className = 'alert alert-' + tipo;
  };

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    f.classList.add('was-validated');
    if (!f.checkValidity()) { mostrar('Revisa los campos marcados y vuelve a intentar.', 'danger'); f.querySelector(':invalid').focus(); return; }
    const boton = document.getElementById('enviar');
    boton.disabled = true;
    const r = await PP.api('/api/contacto', {
      method: 'POST',
      body: { nombre: f.nombre.value, email: f.email.value, asunto: f.asunto.value, mensaje: f.mensaje.value, sitio: f.sitio.value },
    });
    boton.disabled = false;
    if (r.ok) {
      mostrar(r.json.message || 'Mensaje enviado.', 'success');
      f.reset(); f.classList.remove('was-validated'); cuenta.textContent = '0';
    } else {
      mostrar(r.json.message || 'No se pudo enviar el mensaje.', 'danger');
    }
    msg.focus();
  });
})();

const alertas = document.querySelector('#alertas');

// Valida con la API nativa de HTML5 (required, type=email, minlength)
function valido(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    showAlert(alertas, 'Revisa los campos: correo válido y contraseña de al menos 6 caracteres.');
    return false;
  }
  return true;
}

document.querySelector('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que el formulario recargue la página
  if (!valido(e.target)) return;
  try {
    await api('/api/auth/login', 'POST', {
      email: document.querySelector('#login-email').value,
      password: document.querySelector('#login-password').value
    });
    window.location.href = 'panel.html';
  } catch (err) { showAlert(alertas, err.message); }
});

document.querySelector('#form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!valido(e.target)) return;
  try {
    await api('/api/auth/register', 'POST', {
      email: document.querySelector('#reg-email').value,
      password: document.querySelector('#reg-password').value
    });
    e.target.reset();
    e.target.classList.remove('was-validated');
    showAlert(alertas, 'Cuenta creada. Ya puedes iniciar sesión.', 'success');
  } catch (err) { showAlert(alertas, err.message); }
});

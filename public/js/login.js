// [Yaritza] Lógica de Inicio de Sesión y Registro (public/login.html)
// Depende de: js/common.js (api, showAlert)

const alertas = document.querySelector('#alertas');

// Si viene redirigido por sesión vencida (?expired=1), informar al usuario
if (new URLSearchParams(window.location.search).get('expired') === '1') {
  showAlert(alertas, 'Tu sesión ha expirado por seguridad. Vuelve a iniciar sesión.', 'warning');
}

function valido(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    showAlert(alertas, 'Revisa los campos: correo válido y contraseña de al menos 8 caracteres.');
    return false;
  }
  return true;
}

document.querySelector('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!valido(e.target)) return;
  try {
    await api(
      '/api/auth/login',
      'POST',
      {
        email: document.querySelector('#login-email').value.trim(),
        password: document.querySelector('#login-password').value
      },
      { redirigirEn401: false }
    );
    window.location.href = 'panel.html';
  } catch (err) {
    showAlert(alertas, err.message, 'danger');
  }
});

document.querySelector('#form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!valido(e.target)) return;
  try {
    await api(
      '/api/auth/register',
      'POST',
      {
        nombre: document.querySelector('#reg-nombre')?.value.trim() || 'Asesor Especialista',
        email: document.querySelector('#reg-email').value.trim(),
        password: document.querySelector('#reg-password').value
      },
      { redirigirEn401: false }
    );
    e.target.reset();
    e.target.classList.remove('was-validated');
    showAlert(alertas, 'Cuenta creada con contraseña cifrada. Ya puedes iniciar sesión.', 'success');
  } catch (err) {
    showAlert(alertas, err.message, 'danger');
  }
});
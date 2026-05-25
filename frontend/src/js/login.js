// ===== SGTI Municipal — Login =====
import api from './api.js';

export function renderLogin() {
  document.body.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          <div class="login-logo-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1>SGTI</h1>
        </div>
        <div class="login-subtitle">Sistema de Gestión Territorial Integrado<br>Carmen de La Legua Reynoso</div>
        <form class="login-form" id="login-form" autocomplete="off">
          <div class="login-error" id="login-error"></div>
          <div class="input-group">
            <label for="login-user">Usuario</label>
            <input type="text" id="login-user" placeholder="Ingrese su usuario" autocomplete="off" required>
          </div>
          <div class="input-group">
            <label for="login-pass">Contraseña</label>
            <input type="password" id="login-pass" placeholder="Ingrese su contraseña" autocomplete="new-password" required>
          </div>
          <button type="submit" class="login-btn" id="login-btn">Iniciar Sesión</button>
        </form>
        <div class="login-footer" style="padding-bottom:15px; color:var(--text-muted);">
          SGTI Municipal · Acceso Restringido
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;

  btn.disabled = true;
  btn.textContent = 'Ingresando...';
  errEl.classList.remove('show');

  try {
    const data = await api.login(username, password);
    
    if (data && data.user && data.user.rol === 'operador') {
      api.clearToken();
      throw new Error('Acceso denegado: Los operadores solo deben usar el Aplicativo Móvil.');
    }

    window.location.reload();
  } catch (err) {
    errEl.textContent = err.message || 'Error de autenticación';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Iniciar Sesión';
  }
}

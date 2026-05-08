import api from './api.js';

export async function renderEquipoList() {
  const container = document.getElementById('equipo-lista-container');
  const badge = document.getElementById('equipo-count-badge');
  if (!container) return;

  // Inyectar campos dinámicos una sola vez si no existen
  renderDynamicFields();

  try {
    const equipo = await api.getEquipo();
    badge.textContent = `${equipo.length} Usuarios Registrados`;

    if (equipo.length === 0) {
      container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-dim)">No hay personal registrado bajo su supervisión.</div>';
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Gerencia / Área</th>
            <th>Usuario</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${equipo.map(u => `
            <tr>
              <td><div style="display:flex; align-items:center; gap:10px;"><div class="avatar" style="width:24px; height:24px; font-size:10px;">${u.nombre.charAt(0)}</div> ${u.nombre}</div></td>
              <td><span class="badge badge-blue" style="text-transform: capitalize;">${u.gerencia}</span></td>
              <td><code>${u.username}</code></td>
              <td>${new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-ghost" style="color:var(--red); padding:4px 8px; font-size:10px;" onclick="confirmarEliminarEquipo(${u.id}, '${u.nombre}')">
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div style="padding:40px; color:var(--red)">Error: ${err.message}</div>`;
  }
}

async function renderDynamicFields() {
  const extraContainer = document.getElementById('eq-extra-fields');
  if (!extraContainer || extraContainer.innerHTML !== '') return;

  const user = JSON.parse(localStorage.getItem('sgti_user') || '{}');
  let html = '';

  if (user.rol === 'admin') {
    html = `
      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:10px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">ROL DEL USUARIO</label>
        <select id="eq-rol" class="filter-select" style="width:100%; padding:10px;">
          <option value="operador">Operador de Campo</option>
          <option value="gerente">Gerente de Área</option>
        </select>
      </div>
      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:10px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">GERENCIA / ÁREA</label>
        <select id="eq-gerencia" class="filter-select" style="width:100%; padding:10px;">
          <option value="municipal">Gerencia Municipal</option>
          <option value="seguridad">Seguridad Ciudadana</option>
          <option value="ambiental">Desarrollo Ambiental</option>
          <option value="rentas">Rentas</option>
          <option value="urbano">Desarrollo Urbano</option>
          <option value="humano">Desarrollo Humano</option>
        </select>
      </div>
    `;
  } else if (user.rol === 'gerente') {
    // Si es gerente, el rol siempre es operador
    html = `<input type="hidden" id="eq-rol" value="operador">`;
    
    if (user.gerencia === 'seguridad') {
      html += `
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:10px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">SUB-ÁREA ESPECÍFICA</label>
          <select id="eq-gerencia" class="filter-select" style="width:100%; padding:10px;">
            <option value="serenazgo">Serenazgo</option>
            <option value="fiscalizacion">Fiscalización y Sanciones</option>
            <option value="transporte">Transporte y Vialidad</option>
          </select>
        </div>
      `;
    } else {
      // Para otras gerencias, se auto-asigna su gerencia actual
      html += `<input type="hidden" id="eq-gerencia" value="${user.gerencia}">
               <div style="margin-bottom:14px; padding:10px; background:var(--bg-light); border-radius:8px; border:1px solid var(--border-light)">
                 <span style="font-size:10px; color:var(--text-dim)">Registrando personal para:</span><br>
                 <strong style="text-transform: capitalize; color:var(--blue)">${user.gerencia}</strong>
               </div>`;
    }
  }

  extraContainer.innerHTML = html;
}

export async function crearUsuarioEquipo() {
  const nombre = document.getElementById('eq-nombre').value;
  const username = document.getElementById('eq-user').value;
  const password = document.getElementById('eq-pass').value;
  const msg = document.getElementById('eq-msg');

  // Capturar campos dinámicos
  const rolEl = document.getElementById('eq-rol');
  const gerEl = document.getElementById('eq-gerencia');
  const rol = rolEl ? rolEl.value : 'operador';
  const gerencia = gerEl ? gerEl.value : null;

  msg.innerHTML = '<span style="color:var(--blue)">⏳ Creando...</span>';

  try {
    await api.crearUsuarioEquipo({ nombre, username, password, rol, gerencia });
    msg.innerHTML = '<span style="color:var(--green)">✅ ¡Usuario creado con éxito!</span>';
    document.getElementById('form-crear-usuario').reset();
    renderEquipoList();
    setTimeout(() => { msg.innerHTML = ''; }, 3000);
  } catch (err) {
    msg.innerHTML = `<span style="color:var(--red)">❌ Error: ${err.message}</span>`;
  }
}

window.confirmarEliminarEquipo = async (id, nombre) => {
  if (confirm(`¿Estás seguro de que deseas eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) {
    try {
      await api.eliminarUsuarioEquipo(id);
      renderEquipoList();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  }
};

import api from './api.js';

let currentEquipoData = [];

export async function renderEquipoList() {
  const container = document.getElementById('equipo-lista-container');
  const badge = document.getElementById('equipo-count-badge');
  if (!container) return;

  // Inyectar campos dinámicos una sola vez si no existen
  renderDynamicFields();

  try {
    let equipo = await api.getEquipo();
    
    // Configurar y aplicar filtro de sub-área
    const user = JSON.parse(localStorage.getItem('sgti_user') || '{}');
    const filtroEl = document.getElementById('eq-filtro-subarea');
    
    if (filtroEl) {
      if (user.gerencia === 'seguridad' || user.rol === 'admin') {
        filtroEl.style.display = 'block';
        const subareaSelected = filtroEl.value;
        if (subareaSelected !== 'todos') {
          equipo = equipo.filter(u => u.gerencia === subareaSelected);
        }
      } else {
        filtroEl.style.display = 'none';
      }
    }

    currentEquipoData = equipo;
    window.filtrarEquipo();
    // Cargar panel de supervisores por turno
    cargarSupervisoresTurno();
  } catch (err) {
    container.innerHTML = `<div style="padding:40px; color:var(--red)">Error: ${err.message}</div>`;
  }
}

window.filtrarEquipo = () => {
  const container = document.getElementById('equipo-lista-container');
  const badge = document.getElementById('equipo-count-badge');
  const searchTerm = (document.getElementById('eq-search')?.value || '').toLowerCase();
  
  if (!container) return;

  const filtered = currentEquipoData.filter(u => u.nombre.toLowerCase().includes(searchTerm));
  badge.textContent = `${filtered.length} Usuarios Registrados`;

  if (filtered.length === 0) {
    container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-dim)">No se encontraron usuarios.</div>';
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Nombre Completo</th>
          <th>Gerencia / Área</th>
          <th>Rol</th>
          <th>Usuario</th>
          <th>Reportes Hoy</th>
          <th>Fecha Registro</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(u => `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="avatar" style="width:24px; height:24px; font-size:10px;">${u.nombre.charAt(0)}</div>
                <a href="#" onclick="verReportesUsuario(${u.id}, '${u.nombre}')" style="color:var(--blue); text-decoration:none; font-weight:600;" title="Ver reportes de ${u.nombre}">${u.nombre}</a>
              </div>
            </td>
            <td><span class="badge badge-blue" style="text-transform: capitalize;">${u.gerencia}</span></td>
            <td><span style="font-size:11px; font-weight:600; color:var(--text-dim); background:rgba(0,0,0,0.05); padding:3px 6px; border-radius:4px;">${u.rol === 'visor' ? '👑 Supervisor' : '📱 Operador'}</span></td>
            <td><code>${u.username}</code></td>
            <td>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-weight:700; color:${u.reportesHoy > 0 ? 'var(--green)' : 'var(--text-dim)'}">${u.reportesHoy || 0}</span>
                <span style="font-size:10px; color:var(--text-muted)">reportes</span>
              </div>
            </td>
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
};

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
    if (user.gerencia === 'seguridad') {
      html += `
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:10px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">ROL DEL USUARIO</label>
          <select id="eq-rol" class="filter-select" style="width:100%; padding:10px;">
            <option value="operador">Operador de Campo (App Móvil)</option>
            <option value="visor">Supervisor de Oficina (Panel Web)</option>
          </select>
        </div>
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
      html = `<input type="hidden" id="eq-rol" value="operador">
              <input type="hidden" id="eq-gerencia" value="${user.gerencia}">
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

window.verReportesUsuario = async (id, nombre) => {
  // Crear overlay modal si no existe
  let modal = document.getElementById('user-reports-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'user-reports-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }

  modal.innerHTML = `
    <div class="modal" style="max-width:600px; width:90%; max-height:80vh; display:flex; flex-direction:column;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0;">📝 Reportes de ${nombre}</h3>
        <button class="btn btn-ghost" onclick="document.getElementById('user-reports-modal').style.display='none'">✖</button>
      </div>
      <div id="user-reports-content" style="flex:1; overflow-y:auto; padding-right:8px;">
        <div class="spinner-container" style="padding:40px;"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  try {
    const reportes = await api.getUsuarioReportes(id);
    const content = document.getElementById('user-reports-content');
    
    if (reportes.length === 0) {
      content.innerHTML = '<div style="padding:30px; text-align:center; color:var(--text-dim)">Este usuario aún no ha realizado ningún reporte.</div>';
      return;
    }

    content.innerHTML = `<div style="display:flex; flex-direction:column; gap:12px;">
      ${reportes.map(r => `
        <div style="border:1px solid var(--border-light); border-radius:8px; padding:12px; background:var(--bg-light);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <span class="badge" style="background:${r.prioridad==='Alta'?'var(--red)':'var(--yellow)'}; color:#fff;">${r.prioridad}</span>
              <span class="badge badge-blue">${r.categoria}</span>
            </div>
            <span style="font-size:10px; color:var(--text-muted)">${new Date(r.fecha).toLocaleString()}</span>
          </div>
          <p style="margin:0 0 8px 0; font-size:13px; color:var(--text-color);">${r.mensaje}</p>
          <div style="font-size:11px; color:var(--text-dim); margin-bottom:8px;">📍 ${r.ubicacion || 'Ubicación desconocida'}</div>
          ${r.fotoUrl ? `<div style="margin-top:8px;"><img src="${r.fotoUrl}" style="max-width:100%; max-height:200px; border-radius:6px; object-fit:cover; cursor:pointer;" onclick="window.open(this.src, '_blank')"></div>` : ''}
          <div style="margin-top:8px; font-size:11px;">
            Estado: <strong style="text-transform:capitalize; color:${r.estado==='nuevo'?'var(--red)':r.estado==='en proceso'?'var(--yellow)':'var(--green)'}">${r.estado}</strong>
          </div>
        </div>
      `).join('')}
    </div>`;
  } catch (err) {
    document.getElementById('user-reports-content').innerHTML = `<div style="color:var(--red)">Error al cargar reportes: ${err.message}</div>`;
  }
};


// ========================================
// SUPERVISORES POR TURNO
// ========================================
let supervisoresConfigActual = {
  supervisor_manana: '',
  supervisor_tarde: '',
  supervisor_noche: ''
};

export async function cargarSupervisoresTurno() {
  const panel = document.getElementById('panel-supervisores-turno');
  if (!panel) return;

  try {
    // 1. Cargar todo el personal (excepto admin), incluyendo operadores, supervisores y gerentes
    const equipo = await api.getEquipo();
    const personal = equipo.filter(u => u.rol !== 'admin');

    const selectPersonal = document.getElementById('sup-turno-personal');
    if (selectPersonal) {
      selectPersonal.innerHTML = '<option value="">(Seleccionar personal de campo/operador...)</option>';
      personal.forEach(p => {
        const rolLabel = p.rol === 'operador' ? 'Operador de Campo' : p.rol === 'visor' ? 'Supervisor' : 'Gerente';
        selectPersonal.innerHTML += `<option value="${p.nombre}">${p.nombre} [${rolLabel} - ${p.gerencia}]</option>`;
      });
    }

    // 2. Cargar configuración guardada y actualizar interfaz
    const config = await api.getSupervisoresTurno();
    supervisoresConfigActual = {
      supervisor_manana: config.supervisor_manana || '',
      supervisor_tarde: config.supervisor_tarde || '',
      supervisor_noche: config.supervisor_noche || ''
    };

    // Actualizar las tarjetas visuales de resumen
    document.getElementById('resumen-sup-manana').textContent = supervisoresConfigActual.supervisor_manana || '(Sin asignar)';
    document.getElementById('resumen-sup-tarde').textContent = supervisoresConfigActual.supervisor_tarde || '(Sin asignar)';
    document.getElementById('resumen-sup-noche').textContent = supervisoresConfigActual.supervisor_noche || '(Sin asignar)';

  } catch (err) {
    console.error('Error cargando supervisores de turno:', err);
  }
}

export async function guardarSupervisorTurnoUnico() {
  const msg = document.getElementById('sup-turno-msg');
  const selectPersonal = document.getElementById('sup-turno-personal');
  const selectTipo = document.getElementById('sup-turno-tipo');
  
  if (!selectPersonal || !selectTipo) return;

  const nombreSeleccionado = selectPersonal.value;
  const turnoClave = selectTipo.value;

  if (!nombreSeleccionado) {
    if (msg) {
      msg.innerHTML = '<span style="color:var(--red)">❌ Por favor, seleccione un personal</span>';
      setTimeout(() => { msg.innerHTML = ''; }, 3000);
    }
    return;
  }

  if (msg) msg.innerHTML = '<span style="color:var(--blue)">⏳ Guardando asignación...</span>';

  // Actualizar el estado local
  supervisoresConfigActual[turnoClave] = nombreSeleccionado;

  try {
    // Enviar el conjunto completo actualizado a la base de datos
    await api.setSupervisoresTurno(supervisoresConfigActual);

    // Actualizar visualmente la tarjeta correspondiente
    if (turnoClave === 'supervisor_manana') {
      document.getElementById('resumen-sup-manana').textContent = nombreSeleccionado;
    } else if (turnoClave === 'supervisor_tarde') {
      document.getElementById('resumen-sup-tarde').textContent = nombreSeleccionado;
    } else if (turnoClave === 'supervisor_noche') {
      document.getElementById('resumen-sup-noche').textContent = nombreSeleccionado;
    }

    if (msg) {
      msg.innerHTML = '<span style="color:var(--green)">✅ Turno asignado y guardado correctamente</span>';
      setTimeout(() => { msg.innerHTML = ''; }, 3000);
    }

    // Limpiar selección de personal para la próxima asignación
    selectPersonal.value = '';

  } catch (err) {
    if (msg) {
      msg.innerHTML = `<span style="color:var(--red)">❌ Error: ${err.message}</span>`;
      setTimeout(() => { msg.innerHTML = ''; }, 4000);
    }
  }
}

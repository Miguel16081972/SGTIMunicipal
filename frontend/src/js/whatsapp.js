// ===== SGTI Municipal — WhatsApp Central =====
import api from './api.js';
import { logActivity } from './activity.js';

export let currentWspGroup = 'municipal';
let wspFeeds = {
  municipal: [], seguridad: [], ambiental: [], rentas: [], urbano: [], humano: [], participacion: [], opc: [], demuna: [], ciam: [], omaped: [], otros: []
};

export function getWspFeeds() { return wspFeeds; }

export async function renderWspFeed(grupo) {
  currentWspGroup = grupo;
  refreshWspStats(); // Refresh trends and counts too
  const feedEl = document.getElementById('wsp-feed');
  const titleEl = document.getElementById('wsp-feed-title');
  if (!feedEl) return;
  
  // Highlight card
  document.querySelectorAll('.wsp-card').forEach(c => c.style.borderColor = '');
  const activeCard = document.getElementById(`wsp-btn-${grupo}`);
  if (activeCard) activeCard.style.borderColor = 'var(--blue)';

  const grupoNames = { municipal: 'Gerencia Municipal', seguridad: 'Seguridad Ciudadana', ambiental: 'Desarrollo Ambiental', rentas: 'Rentas', urbano: 'Desarrollo Urbano', humano: 'Desarrollo Humano', participacion: 'Participación Vecinal', opc: 'OPC', demuna: 'DEMUNA', ciam: 'CIAM', omaped: 'OMAPED', otros: 'Otros' };
  titleEl.textContent = `Feed — ${grupoNames[grupo] || grupo}`;

  const from = document.getElementById('filter-from')?.value;
  const to = document.getElementById('filter-to')?.value;

  try {
    const { reportes } = await api.getWhatsappReportes({ grupo, limit: 50, from, to });
    wspFeeds[grupo] = reportes || [];
    
    feedEl.innerHTML = '';
    if (wspFeeds[grupo].length === 0) {
      feedEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-dim)">No hay mensajes recientes en este grupo</div>';
      return;
    }

    wspFeeds[grupo].forEach(m => {
      const card = document.createElement('div');
      card.className = 'feed-item';
      card.innerHTML = `
        <div class="fi-header">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="fi-avatar">${(m.reportadoPor || '?').charAt(0)}</div>
            <div>
              <div class="fi-user">${m.reportadoPor} <span style="font-size:9px; color:var(--text-muted); font-weight:normal; text-transform:uppercase;"> — ${m.categoria || ''}</span></div>
              <div class="fi-time">${new Date(m.fecha).toLocaleString()}</div>
            </div>
          </div>
          <span class="badge ${m.estado==='atendido'?'badge-green':(m.estado==='en_proceso'?'badge-amber':'badge-red')}">${m.estado.toUpperCase()}</span>
        </div>
        <div class="fi-body">${m.mensaje}</div>
        ${m.fotoUrl ? `<div class="fi-img-wrap" style="margin-top:10px; margin-bottom:12px;"><img src="${m.fotoUrl.startsWith('data:') ? m.fotoUrl : 'data:image/jpeg;base64,' + m.fotoUrl}" style="width:120px; height:120px; object-fit:cover; border-radius:12px; cursor:zoom-in; border:2px solid var(--blue); box-shadow: 0 4px 15px rgba(0,0,0,0.2)" onclick="window.open('${m.fotoUrl.startsWith('data:') ? m.fotoUrl : 'data:image/jpeg;base64,' + m.fotoUrl}', '_blank')"></div>` : ''}
        ${m.ubicacion ? `<div class="fi-loc">📍 ${m.ubicacion}</div>` : ''}
        <div class="fi-actions">
           <button class="btn btn-ghost" style="font-size:10px;padding:2px 8px" onclick="verReporte('${m.id}')">Gestionar →</button>
        </div>
      `;
      feedEl.appendChild(card);
    });
  } catch (err) {
    feedEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--red)">Error cargando feed</div>';
  }
}

export function switchWspGroup(grupo) {
  renderWspFeed(grupo);
  // Update map if needed
  import('./maps.js').then(m => m.updateWspMapMarkers(grupo, wspFeeds)).catch(()=>{});
}
window.switchWspGroup = switchWspGroup;

export async function refreshWspStats() {
  try {
    const data = await api.getWhatsappStats();
    
    // 1. Actualizar conteos de mensajes por grupo
    if (data && data.porGerencia) {
      data.porGerencia.forEach(g => {
        const countEl = document.getElementById(`wsp-count-${g.grupo}`);
        if (countEl) {
          countEl.textContent = `${g.total || 0} msg`;
        }
      });
    }

    // 2. Renderizar Temas Tendencia (Reales)
    const trendingContainer = document.getElementById('wsp-trending');
    if (trendingContainer && data.tendencias) {
      trendingContainer.innerHTML = '';
      if (data.tendencias.length === 0) {
        trendingContainer.innerHTML = '<div style="font-size:10px;color:var(--text-muted)">No hay suficientes reportes hoy para marcar tendencias</div>';
      } else {
        data.tendencias.forEach(t => {
          const tag = document.createElement('div');
          tag.className = 'trending-tag';
          
          // Asignar icono según tema
          let icon = '📢';
          const tema = t.tema.toLowerCase();
          if (tema.includes('seguridad')) icon = '🚨';
          else if (tema.includes('basura') || tema.includes('limpieza')) icon = '🗑️';
          else if (tema.includes('ruido') || tema.includes('sonora')) icon = '🔊';
          else if (tema.includes('parque') || tema.includes('ambiental')) icon = '🌿';
          else if (tema.includes('pista') || tema.includes('urbano')) icon = '🏗️';
          else if (tema.includes('alumbrado') || tema.includes('luz')) icon = '💡';
          else if (tema.includes('comercio') || tema.includes('rentas')) icon = '💰';
          else if (tema.includes('transito') || tema.includes('vehiculo')) icon = '🚗';
          else if (tema.includes('animal') || tema.includes('perro')) icon = '🐕';

          tag.innerHTML = `${icon} ${t.tema} <span class="tt-count">${t.total}</span>`;
          trendingContainer.appendChild(tag);
        });
      }
    }
  } catch (err) {
    console.error('Error actualizando stats wsp:', err);
  }
}

// ===== TABS =====
export function switchWspTab(tab) {
  document.querySelectorAll('#tabs-whatsapp .tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#view-whatsapp .tab-content').forEach(el => el.classList.remove('active'));
  
  const targetTab = document.querySelector(`#tabs-whatsapp .tab[onclick*="'${tab}'"]`);
  const targetContent = document.getElementById(`wsp-tab-${tab}`);
  
  if (targetTab) targetTab.classList.add('active');
  if (targetContent) targetContent.classList.add('active');
  
  if (tab === 'feed') refreshWspStats();
  
  if (tab === 'conexion') {
    checkWspConnection();
    if (!connectionCheckInterval) {
      connectionCheckInterval = setInterval(checkWspConnection, 5000);
    }
  } else {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
      connectionCheckInterval = null;
    }
  }
  
  if (tab === 'reportes') refreshReportes();
  
  // Invalidate map size whenever we switch tabs because layout might shift
  import('./maps.js').then(m => m.initMapWsp()).catch(()=>{});
}
window.switchWspTab = switchWspTab;

// ===== CONEXION =====
let connectionCheckInterval = null;

export async function checkWspConnection() {
  const container = document.getElementById('wsp-status-container');
  if (!container) return;

  // Guardar posición de scroll si el elemento ya existe
  const groupScrollEl = container.querySelector('.group-mgmt-list');
  const scrollPos = groupScrollEl ? groupScrollEl.scrollTop : 0;

  try {
    const status = await api.getWhatsappStatus();
    
    // El backend devuelve isAuthenticated y qrCode
    if (status.isAuthenticated) {
      container.innerHTML = `
        <div style="color:var(--green);margin-bottom:16px">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h4 style="font-size:20px;margin-bottom:8px">Conectado con Éxito</h4>
        <p style="color:var(--text-dim)">El bot está activo y procesando mensajes en tiempo real.</p>
        
        <div style="margin-top:24px; font-size:12px; padding:16px; background:rgba(255,255,255,0.05); border-radius:12px; text-align:left;">
           <div style="margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; font-weight:bold; color:var(--blue); display:flex; justify-content:space-between; align-items:center;">
             <span>📊 Gestión de Grupos Detectados (${status.totalGroups || 0})</span>
             <span style="font-size:10px; font-weight:normal; color:var(--text-dim)">${status.monitoredCount || 0} activos</span>
           </div>
           <div class="group-mgmt-list" style="max-height:300px; overflow-y:auto; padding-right:8px;">
             ${status.connectedGroups && status.connectedGroups.length > 0 
               ? status.connectedGroups.map(g => `
                  <div class="group-mgmt-item" style="display:flex; align-items:center; gap:12px; margin-bottom:12px; padding:8px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid ${g.isMonitored ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)'}">
                    <div style="flex:1">
                      <div style="font-weight:600; font-size:12px; color:var(--text-bright); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${g.name}">${g.name}</div>
                      <div style="font-size:9px; color:var(--text-dim); font-family:monospace;">${g.id}</div>
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:8px">
                      <select class="filter-select" style="font-size:10px; padding:4px 8px; height:auto; width:130px" onchange="cambiarAreaGrupo('${g.id}', '${g.name}', this.value)">
                        <option value="municipal" ${g.area==='municipal'?'selected':''}>🏢 Ger. Municipal</option>
                        <option value="seguridad" ${g.area==='seguridad'?'selected':''}>🛡️ Seg. Ciudadana</option>
                        <option value="ambiental" ${g.area==='ambiental'?'selected':''}>🌿 Des. Ambiental</option>
                        <option value="rentas" ${g.area==='rentas'?'selected':''}>💰 Rentas</option>
                        <option value="urbano" ${g.area==='urbano'?'selected':''}>🏗️ Des. Urbano</option>
                        <option value="humano" ${g.area==='humano'?'selected':''}>👥 Des. Humano</option>
                        <option value="participacion" ${g.area==='participacion'?'selected':''}>🤝 Part. Vecinal</option>
                        <option value="opc" ${g.area==='opc'?'selected':''}>🏛️ OPC</option>
                        <option value="demuna" ${g.area==='demuna'?'selected':''}>⚖️ DEMUNA</option>
                        <option value="ciam" ${g.area==='ciam'?'selected':''}>👴 CIAM</option>
                        <option value="omaped" ${g.area==='omaped'?'selected':''}>♿ OMAPED</option>
                        <option value="otros" ${g.area==='otros' || !g.area ?'selected':''}>❓ Otros / Sin Vinc.</option>
                      </select>
                      
                      <button class="btn ${g.isMonitored ? 'btn-primary' : 'btn-ghost'}" 
                              style="font-size:9px; padding:4px 10px; height:auto; min-width:70px; ${g.isMonitored ? 'background:var(--green); border-color:var(--green)' : ''}" 
                              onclick="toggleGrupoMonitoreo('${g.id}', '${g.name}', ${!g.isMonitored})">
                        ${g.isMonitored ? 'ACTIVO' : 'IGNORAR'}
                      </button>
                    </div>
                  </div>
                 `).join('')
               : '<div style="color:var(--text-dim);text-align:center;padding:20px;">No se detectaron grupos aún. Asegúrate de que el bot esté en grupos de WhatsApp.</div>'
             }
           </div>
           <div style="margin-top:12px; font-size:9px; color:var(--text-muted); text-align:center;">
             💡 Cambia la gerencia para clasificar reportes o usa el botón para habilitar/deshabilitar el monitoreo.
           </div>
        </div>

        <button class="btn btn-ghost" style="margin-top:24px;color:var(--red)" onclick="desconectarWsp()">Desconectar</button>
      `;
      
      // Restaurar scroll
      const newGroupScrollEl = container.querySelector('.group-mgmt-list');
      if (newGroupScrollEl) newGroupScrollEl.scrollTop = scrollPos;
    } else if (status.qrCode) {
      container.innerHTML = `
        <div style="background:white;padding:16px;border-radius:12px;margin-bottom:16px; display:inline-block">
          <img src="${status.qrCode}" alt="QR Code" style="display:block;width:200px;height:200px">
        </div>
        <h4 style="font-size:18px;margin-bottom:8px">Escanea el código QR</h4>
        <p style="color:var(--text-dim);font-size:13px">Abre WhatsApp en tu teléfono > Dispositivos vinculados > Vincular un dispositivo.</p>
        <div style="margin-top:16px;font-size:11px;color:var(--amber); animation: pulse 2s infinite">● Esperando escaneo...</div>
      `;
    } else {
      container.innerHTML = `
        <div class="spinner" style="margin-bottom:16px"></div>
        <h4 style="font-size:18px;margin-bottom:8px">Iniciando Servidor...</h4>
        <p style="color:var(--text-dim); margin-bottom: 8px;">Generando nueva sesión de conexión o cargando recursos.</p>
        <div style="font-size:11px; color:var(--blue); background:rgba(79,143,247,0.1); padding:8px 12px; border-radius:6px; display:inline-block; border:1px solid rgba(79,143,247,0.2)">
          🤖 <b>Log del Bot:</b> ${status.lastLog || 'Iniciando...'}
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = `<div style="color:var(--red)">Error al conectar con el servidor de WhatsApp</div>`;
  }
}

window.desconectarWsp = async () => {
  if (confirm('¿Deseas cerrar la sesión de WhatsApp?')) {
    await api.request('/whatsapp/logout', { method: 'POST' });
    checkWspConnection();
  }
};

window.cambiarAreaGrupo = async (remoteId, nombre, areaId) => {
  try {
    await api.vincularGrupo({ remoteId, nombre, areaId });
    // No hace falta recargar todo, el polling lo hará en unos segundos
    // pero para feedback inmediato:
    checkWspConnection();
  } catch (err) {
    alert('Error al vincular grupo');
  }
};

window.toggleGrupoMonitoreo = async (remoteId, nombre, monitoreado) => {
  try {
    // Si estamos activando, debemos asegurar que tenga un área. 
    // Si no tiene, por defecto municipal.
    await api.vincularGrupo({ remoteId, nombre, monitoreado });
    checkWspConnection();
  } catch (err) {
    alert('Error al cambiar estado de monitoreo');
  }
};

// ===== GESTION DE REPORTES =====

export async function loadReportes() {
  const container = document.getElementById('reportes-lista');
  const kpiContainer = document.getElementById('reportes-kpis');
  if (!container) return;

  try {
    const estado = document.getElementById('rpt-filtro-estado')?.value || 'todos';
    const grupo = document.getElementById('rpt-filtro-grupo')?.value || 'todos';
    const prioridad = document.getElementById('rpt-filtro-prioridad')?.value || 'todas';
    const from = document.getElementById('filter-from')?.value;
    const to = document.getElementById('filter-to')?.value;

    const { reportes, stats } = await api.getWhatsappReportes({ estado, grupo, prioridad, from, to });

    // Actualizar Badge
    const nuevosCount = reportes.filter(r => r.estado === 'nuevo').length;
    const badge = document.getElementById('reportes-badge');
    if (badge) {
      badge.textContent = nuevosCount;
      badge.style.display = nuevosCount > 0 ? 'inline-block' : 'none';
    }

    // KPIs
    if (kpiContainer && stats) {
      kpiContainer.innerHTML = `
        <div class="card card-accent" style="border-left-color:var(--red)"><div class="card-label">Nuevos</div><div class="card-value">${stats.nuevo || 0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--amber)"><div class="card-label">En Proceso</div><div class="card-value">${stats.en_proceso || 0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Atendidos</div><div class="card-value">${stats.atendido || 0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--blue)"><div class="card-label">Total</div><div class="card-value">${reportes.length}</div></div>
      `;
    }

    // Lista
    if (reportes.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:60px;background:var(--glass);border-radius:12px;color:var(--text-dim)">No se encontraron reportes con los filtros seleccionados</div>';
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Mensaje de WhatsApp</th>
              <th>Área / Categoría</th>
              <th>Prioridad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${reportes.map(r => `
              <tr class="${r.estado === 'nuevo' ? 'row-new' : ''}" onclick="verReporte('${r.id}')" style="cursor:pointer">
                <td style="font-family:monospace;font-size:10px">${r.idString || r.id}</td>
                <td><div style="font-size:11px">${new Date(r.fecha).toLocaleDateString()}</div><div style="font-size:9px;color:var(--text-dim)">${new Date(r.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></td>
                <td><div style="font-size:11px; max-width:320px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--blue)" title="${r.mensaje}">${r.mensaje}</div></td>
                <td>
                  <span class="badge badge-gray" style="font-size:9px">${(r.grupo || 'otros').toUpperCase()}</span>
                  <div style="font-weight:600;font-size:10px;margin-top:2px">${r.categoria || 'Sin Clasificar'}</div>
                </td>
                <td><span class="badge ${r.prioridad==='Alta'?'badge-red':(r.prioridad==='Media'?'badge-amber':'badge-green')}">${r.prioridad}</span></td>
                <td><span class="status-pill status-${r.estado}">${r.estado.replace('_',' ')}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<div style="color:var(--red)">Error cargando reportes</div>';
  }
}
window.loadReportes = loadReportes;

export async function cambiarEstadoReporte(id, nuevoEstado) {
  try {
    await api.updateReporte(id, { estado: nuevoEstado });
    logActivity(`Reporte ${id}: estado cambiado a ${nuevoEstado}`);
    refreshReportes();
  } catch (err) {
    alert('Error al actualizar estado');
  }
}
window.cambiarEstadoReporte = cambiarEstadoReporte;

export async function verReporte(id) {
  const modal = document.getElementById('reporte-modal');
  const content = document.getElementById('reporte-modal-content');
  if (!modal || !content) return;

  try {
    const r = await api.getWhatsappReporte(id);
    
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px;">
        <div>
          <h2 style="font-size:20px;margin-bottom:4px">Reporte ${r.idString || r.id}</h2>
          <div style="font-size:12px;color:var(--text-dim)">${new Date(r.fecha).toLocaleString()}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:end; gap:8px">
          <span class="status-pill status-${r.estado}" id="modal-status-badge" style="font-size:12px;padding:6px 12px">${r.estado.replace('_',' ').toUpperCase()}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div class="card" style="padding:12px; background:rgba(255,255,255,0.02)">
          <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:8px;">DATOS DEL CIUDADANO</div>
          <div style="font-size:13px; margin-bottom:4px">👤 ${r.reportadoPor}</div>
          <div style="font-size:12px; color:var(--blue)">📱 ${r.telefono || 'No disponible'}</div>
        </div>
        <div class="card" style="padding:12px; background:rgba(255,255,255,0.02)">
          <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:8px;">CLASIFICACIÓN</div>
          <div style="font-size:13px; margin-bottom:4px">📁 Area: ${(r.grupo || 'otros').toUpperCase()}</div>
          <div style="font-size:12px; font-weight:600">🏷️ ${r.categoria || 'Sin Clasificar'}</div>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:8px;">MENSAJE RECIBIDO</div>
        <div style="padding:12px; background:var(--glass); border-radius:8px; font-size:13px; line-height:1.5; border-left:3px solid var(--blue)">
          ${r.mensaje}
        </div>
      </div>

      ${r.fotoUrl ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:8px;">EVIDENCIA FOTOGRÁFICA</div>
        <div style="text-align:center; background:rgba(0,0,0,0.2); border-radius:12px; padding:10px; border:1px solid rgba(255,255,255,0.05)">
          <img src="${r.fotoUrl.startsWith('data:') ? r.fotoUrl : 'data:image/jpeg;base64,' + r.fotoUrl}" style="max-width:100%; max-height:400px; border-radius:8px; cursor:zoom-in; box-shadow:0 10px 30px rgba(0,0,0,0.5)" onclick="window.open('${r.fotoUrl.startsWith('data:') ? r.fotoUrl : 'data:image/jpeg;base64,' + r.fotoUrl}', '_blank')">
        </div>
      </div>
      ` : ''}

      <div style="margin-bottom:20px; padding:16px; background:rgba(79,143,247,0.05); border-radius:12px; border:1px solid rgba(79,143,247,0.2)">
        <div style="font-size:10px; color:var(--blue); font-weight:800; margin-bottom:12px;">📍 UBICACIÓN Y GESTIÓN</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
           <div>
             <label style="display:block;font-size:10px;margin-bottom:4px">Dirección:</label>
             <input type="text" class="filter-select" id="edit-ubicacion-${r.id}" value="${r.ubicacion || ''}" style="width:100%" placeholder="Ej: Av. Central 123">
           </div>
           <div>
             <label style="display:block;font-size:10px;margin-bottom:4px">Estado del Reporte:</label>
             <select class="filter-select" id="edit-estado-${r.id}" style="width:100%; font-weight:bold; color:var(--blue)">
               <option value="nuevo" ${r.estado==='nuevo'?'selected':''}>🔴 Nuevo (Sin atender)</option>
               <option value="en_proceso" ${r.estado==='en_proceso'?'selected':''}>🟡 En Proceso</option>
               <option value="atendido" ${r.estado==='atendido'?'selected':''}>🟢 Atendido / Finalizado</option>
             </select>
           </div>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;">
           <div>
             <label style="display:block;font-size:10px;margin-bottom:4px">Gerencia Responsable:</label>
             <select class="filter-select" id="edit-grupo-${r.id}" style="width:100%">
               <option value="municipal" ${r.grupo==='municipal'?'selected':''}>Ger. Municipal</option>
               <option value="seguridad" ${r.grupo==='seguridad'?'selected':''}>Seg. Ciudadana</option>
               <option value="ambiental" ${r.grupo==='ambiental'?'selected':''}>Des. Ambiental</option>
               <option value="rentas" ${r.grupo==='rentas'?'selected':''}>Rentas</option>
               <option value="urbano" ${r.grupo==='urbano'?'selected':''}>Des. Urbano</option>
               <option value="humano" ${r.grupo==='humano'?'selected':''}>Des. Humano</option>
               <option value="participacion" ${r.grupo==='participacion'?'selected':''}>Participación Vecinal</option>
               <option value="opc" ${r.grupo==='opc'?'selected':''}>OPC</option>
               <option value="demuna" ${r.grupo==='demuna'?'selected':''}>DEMUNA</option>
               <option value="ciam" ${r.grupo==='ciam'?'selected':''}>CIAM</option>
               <option value="omaped" ${r.grupo==='omaped'?'selected':''}>OMAPED</option>
               <option value="otros" ${r.grupo==='otros'?'selected':''}>Otros</option>
             </select>
           </div>
           <div>
             <label style="display:block;font-size:10px;margin-bottom:4px;color:var(--text-dim)">Coordenadas (Lat/Lng):</label>
             <div style="display:flex; gap:4px">
               <input type="number" step="any" class="filter-select" id="edit-lat-${r.id}" value="${r.lat || ''}" style="width:100%" placeholder="Latitud">
               <input type="number" step="any" class="filter-select" id="edit-lng-${r.id}" value="${r.lng || ''}" style="width:100%" placeholder="Longitud">
             </div>
           </div>
        </div>
        
        <div style="display:flex; gap:8px; margin-top:16px;">
          <button class="btn btn-primary" style="flex:2; height:44px; font-weight:bold" onclick="guardarUbicacion('${r.id}')">💾 GUARDAR CAMBIOS</button>
          <button class="btn btn-ghost" style="flex:1; height:44px; font-size:11px; border-color:var(--green); color:var(--green)" onclick="autolocalizarGps('${r.id}')">📍 Autolocalizar GPS</button>
        </div>
      </div>

      <div style="font-size:10px; color:var(--text-dim); margin-bottom:4px">Mapa Interactivo (Haz clic para señalar lugar exacto y obtener dirección)</div>
      <div id="mini-map-${r.id}" style="height:320px; border-radius:12px; margin-bottom:10px; border:1px solid var(--border-light); cursor:crosshair; box-shadow: inset 0 0 10px rgba(0,0,0,0.5)"></div>
    `;

    modal.classList.add('show');

    // Init mini map
    setTimeout(() => {
      const lat = parseFloat(r.lat) || -12.0435;
      const lng = parseFloat(r.lng) || -77.0955;
      const mEl = document.getElementById(`mini-map-${r.id}`);
      if (!mEl) return;
      const miniMap = L.map(`mini-map-${r.id}`).setView([lat, lng], 17);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(miniMap);
      
      let marker = null;
      if (r.lat && r.lng) {
        marker = L.marker([lat, lng]).addTo(miniMap);
      }

      window._currentMiniMap = miniMap;
      window._currentMarker = marker;

      // HACER EL MAPA CLIQUEABLE PARA SEÑALAR EL LUGAR Y OBTENER DIRECCIÓN
      miniMap.on('click', async (e) => {
        await updateLocationFromCoords(r.id, e.latlng.lat, e.latlng.lng, miniMap);
      });

      async function updateLocationFromCoords(reportId, lat, lng, mapInstance) {
        document.getElementById(`edit-lat-${reportId}`).value = lat.toFixed(6);
        document.getElementById(`edit-lng-${reportId}`).value = lng.toFixed(6);
        
        if (window._currentMarker) {
          window._currentMarker.setLatLng([lat, lng]);
        } else {
          window._currentMarker = L.marker([lat, lng]).addTo(mapInstance);
        }

        // AUTO-DIRECCIONAMIENTO (REVERSE GEOCODING MEJORADO)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`);
          const data = await res.json();
          if (data && data.address) {
             const addr = data.address;
             // Limpiar dirección: Priorizar calle y número
             let shortAddr = '';
             if (addr.road) {
               shortAddr = addr.road;
               if (addr.house_number) shortAddr += ' ' + addr.house_number;
             } else if (addr.amenity || addr.building || addr.pedestrian) {
               shortAddr = addr.amenity || addr.building || addr.pedestrian;
             } else {
               shortAddr = data.display_name.split(',')[0];
             }
             
             // Añadir barrio/distrito para contexto local
             const sub = addr.suburb || addr.neighbourhood || addr.city_district;
             if (sub && !shortAddr.includes(sub)) {
               shortAddr += ', ' + sub;
             }

             document.getElementById(`edit-ubicacion-${reportId}`).value = shortAddr;
          }
        } catch (err) {
          console.warn('No se pudo obtener la dirección automática');
        }
      }

      window.autolocalizarGps = (reportId) => {
        if (!navigator.geolocation) {
          alert('Tu navegador no soporta geolocalización');
          return;
        }
        
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '⌛ Localizando...';
        btn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            await updateLocationFromCoords(reportId, latitude, longitude, window._currentMiniMap);
            window._currentMiniMap.setView([latitude, longitude], 17);
            btn.textContent = originalText;
            btn.disabled = false;
            logActivity('GPS: Ubicación capturada para reporte ' + reportId);
          },
          (err) => {
            alert('Error al obtener GPS: ' + err.message);
            btn.textContent = originalText;
            btn.disabled = false;
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      };

      setTimeout(() => miniMap.invalidateSize(), 300);
    }, 50);

    logActivity(`Detalle reporte: ${r.id}`);
  } catch (err) {
    console.error('Error cargando detalle:', err);
    alert('No se pudo cargar el detalle del reporte.');
  }
}
window.verReporte = verReporte;

export function cerrarReporteModal() {
  document.getElementById('reporte-modal').classList.remove('show');
}
window.cerrarReporteModal = cerrarReporteModal;

export function filtrarReportes() {
  loadReportes();
}
window.filtrarReportes = filtrarReportes;

export async function refreshReportes() {
  logActivity('Reportes: actualización automática/manual');
  await loadReportes();
  if (currentWspGroup) {
    await renderWspFeed(currentWspGroup);
    import('./maps.js').then(m => m.updateWspMapMarkers(currentWspGroup, wspFeeds)).catch(()=>{});
  }
}
window.refreshReportes = refreshReportes;

// Inicializar auto-refresco
let autoRefreshActive = false;
export function startAutoRefresh() {
  if (autoRefreshActive) return;
  autoRefreshActive = true;
  setInterval(() => {
    refreshReportes();
  }, 10000);
}

export async function guardarUbicacion(id) {
  try {
    const lat = document.getElementById(`edit-lat-${id}`).value;
    const lng = document.getElementById(`edit-lng-${id}`).value;
    const ubicacion = document.getElementById(`edit-ubicacion-${id}`).value;
    const grupo = document.getElementById(`edit-grupo-${id}`).value;
    const estado = document.getElementById(`edit-estado-${id}`).value;
    
    await api.updateReporte(id, { 
      lat: lat ? parseFloat(lat) : null, 
      lng: lng ? parseFloat(lng) : null, 
      ubicacion,
      grupo,
      estado
    });
    
    logActivity(`Reporte ${id}: ubicación y estado (${estado}) actualizados.`);
    
    cerrarReporteModal();
    await refreshReportes();
    
    // Forzar actualización de capas de mapa si estamos en la vista de mapas
    import('./maps.js').then(m => {
      m.updateWspMapMarkers(currentWspGroup, wspFeeds);
    }).catch(()=>{});

  } catch (err) {
    console.error('Error guardando ubicacion:', err);
    alert('Error al guardar los cambios.');
  }
}
window.guardarUbicacion = guardarUbicacion;

window.exportarMantenimiento = async function() {
  const mes = document.getElementById('mnt-mes').value;
  const anio = document.getElementById('mnt-anio').value;
  
  const url = `/api/whatsapp/export/${anio}/${mes}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${api.getToken()}` }
    });
    
    if (!response.ok) throw new Error('No hay datos para este periodo o error en servidor');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Respaldo_SGTI_${anio}_${mes}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    logActivity(`Respaldo descargado: ${mes}/${anio}`);
  } catch (err) {
    alert(err.message);
  }
};

window.limpiarMantenimiento = async function() {
  const mes = document.getElementById('mnt-mes').value;
  const anio = document.getElementById('mnt-anio').value;
  const confirmCheck = document.getElementById('mnt-confirm').checked;
  
  if (!confirmCheck) {
    alert('Debes marcar la casilla de confirmación antes de eliminar.');
    return;
  }
  
  if (!confirm(`¿ESTÁS SEGURO? Esta acción eliminará PERMANENTEMENTE todas las incidencias de ${mes}/${anio} de la base de datos.`)) {
    return;
  }

  try {
    const res = await api.deleteWhatsappPurge(anio, mes);
    alert(res.message);
    logActivity(`Limpieza de base de datos ejecutada: ${mes}/${anio}`);
    refreshReportes();
  } catch (err) {
    alert('Error al limpiar: ' + err.message);
  }
};

window.limpiarDemo = async function() {
  if (!confirm('¿Deseas eliminar los reportes de prueba antiguos y limpiar las tablas de demostración?\n\nSolo se mantendrán los reportes generados hoy.')) {
    return;
  }

  try {
    const res = await api.request('/whatsapp/cleanup-demo', { method: 'DELETE' });
    alert(res.message);
    logActivity('Limpieza de datos demo ejecutada');
    refreshReportes();
  } catch (err) {
    alert('Error al limpiar demo: ' + err.message);
  }
};

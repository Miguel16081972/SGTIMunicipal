// ===== SGTI Municipal — Main Entry Point =====
import './styles/main.css';
import './styles/sidebar.css';
import './styles/components.css';
import './styles/login.css';
import './styles/reportes.css';

import api from './js/api.js';
import { renderLogin } from './js/login.js';
import { renderViews } from './js/views.js';
import { showView, toggleGerencia, switchTab, animateCounters } from './js/navigation.js';
import { toggleTheme, updateClock } from './js/theme.js';
import { applyFilters, resetFilters, handleSearch, exportCurrentTable } from './js/filters.js';
import { toggleNotifs, clearNotifs, setupNotifClickAway, toggleCompare } from './js/notifications.js';
import { generateReportesPdf } from './js/pdf.js';
import { switchWspGroup, renderWspFeed, switchWspTab, filtrarReportes, refreshReportes, startAutoRefresh, cambiarEstadoReporte, verReporte, cerrarReporteModal } from './js/whatsapp.js';
import { logActivity, renderActivityLog, seedActivityLog } from './js/activity.js';
import { renderEquipoList, crearUsuarioEquipo, cargarSupervisoresTurno, guardarSupervisorTurnoUnico } from './js/equipo.js';

// Check auth
if (!api.isAuthenticated()) {
  renderLogin();
} else {
  initApp();
}

function initApp() {
  // Render dashboard views HTML
  renderViews();

  // Inicializar filtros con fechas actuales
  resetFilters();

  // Make functions globally available for inline onclick handlers
  window.showView = showView;
  window.toggleGerencia = toggleGerencia;
  window.switchTab = switchTab;
  window.toggleTheme = toggleTheme;
  window.applyFilters = applyFilters;
  window.resetFilters = resetFilters;
  window.handleSearch = handleSearch;
  window.exportCurrentTable = exportCurrentTable;
  window.toggleNotifs = toggleNotifs;
  window.clearNotifs = clearNotifs;
  window.toggleCompare = toggleCompare;
  window.generateReportesPdf = generateReportesPdf;
  window.switchWspGroup = switchWspGroup;
  window.switchWspTab = switchWspTab;
  window.filtrarReportes = filtrarReportes;
  window.refreshReportes = refreshReportes;
  window.cambiarEstadoReporte = cambiarEstadoReporte;
  window.verReporte = verReporte;
  window.cerrarReporteModal = cerrarReporteModal;
  window.showWspGerencia = (g) => {
    const user = api.getUser();
    const subAreasSeguridad = ['serenazgo', 'fiscalizacion', 'transporte'];
    
    // Si el botón intenta cargar 'seguridad' pero el usuario es de una sub-área, forzamos su sub-área.
    let targetGroup = g;
    if (g === 'seguridad' && user && subAreasSeguridad.includes(user.gerencia)) {
      targetGroup = user.gerencia;
    }
    
    showView('whatsapp');
    switchWspTab('feed');
    switchWspGroup(targetGroup);
  };
  window.logout = () => api.logout();
  window.crearUsuarioEquipo = crearUsuarioEquipo;
  window.renderEquipoList = renderEquipoList;
  window.guardarSupervisorTurnoUnico = guardarSupervisorTurnoUnico;

  // Clock
  updateClock();
  setInterval(updateClock, 30000);

  // Activity log
  seedActivityLog();
  renderActivityLog();

  // Animated counters
  setTimeout(animateCounters, 150);

  // Notifications click away
  setupNotifClickAway();

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('global-search').focus();
    }
  });

  // Initial WSP feed & Auto-polling
  const user = api.getUser();
  const defaultWsp = (user && user.gerencia !== 'all') ? user.gerencia : 'municipal';
  renderWspFeed(defaultWsp);
  startAutoRefresh();

  // Gerencia toggles
  document.querySelectorAll('.gerencia-toggle').forEach((g, i) => {
    if (i > 0) g.classList.remove('open');
  });

  // Mostrar info del usuario y aplicar RBAC
  if (user) {
    const userEl = document.getElementById('user-name');
    if (userEl) userEl.textContent = user.nombre;

    if (user.gerencia !== 'all') {
      // 1. Ocultar nav-items no permitidos
      document.querySelectorAll('.nav-item').forEach(el => {
        const view = el.dataset.view;
        
        // Bloquear Gestión de Equipo para supervisores (visor)
        if (view === 'equipo' && user.rol === 'visor') {
          el.style.display = 'none';
          return;
        }

        if (['mapa', 'actividad', 'equipo'].includes(view)) return;
        
        if (view === 'whatsapp') {
          const onclickAttr = el.getAttribute('onclick') || '';
          const subAreasSeguridad = ['serenazgo', 'fiscalizacion', 'transporte'];
          const mappedGerencia = subAreasSeguridad.includes(user.gerencia) ? 'seguridad' : user.gerencia;
          if (!onclickAttr.includes(`'${mappedGerencia}'`) && !onclickAttr.includes(`"${mappedGerencia}"`)) {
            el.style.display = 'none';
          }
        } else if (view === 'overview') {
          el.style.display = 'none';
        } else {
          // La gerencia municipal ve "riesgo"
          const subAreasSeguridad = ['serenazgo', 'fiscalizacion', 'transporte'];
          const mappedGerencia = subAreasSeguridad.includes(user.gerencia) ? 'seguridad' : user.gerencia;
          const esSuGerencia = view === mappedGerencia || (user.gerencia === 'municipal' && view === 'riesgo');
          if (!esSuGerencia) el.style.display = 'none';
        }
      });

      // 2. Ocultar toggles de gerencias vacías
      document.querySelectorAll('.gerencia-toggle').forEach(el => {
        const next = el.nextElementSibling;
        if (next && next.classList.contains('nav-sub')) {
          let hasVisible = false;
          next.querySelectorAll('.nav-item').forEach(child => {
            if (child.style.display !== 'none') hasVisible = true;
          });
          if (!hasVisible) el.style.display = 'none';
        }
      });

      // 3. Ocultar nav-sections si no son útiles (opcional, lo haremos simple ocultando todas excepto Herramientas)
      document.querySelectorAll('.nav-section').forEach(el => {
        if (!el.textContent.includes('Herramientas') && !el.textContent.includes('Campo')) {
          el.style.display = 'none';
        }
      });

      // Modificar el texto del menú lateral "Seguridad Ciudadana" a su sub-área específica
      if (['fiscalizacion', 'transporte'].includes(user.gerencia)) {
        document.querySelectorAll('.nav-item').forEach(el => {
          if (el.textContent.includes('Seguridad Ciudadana')) {
            el.innerHTML = user.gerencia === 'fiscalizacion' ? 'Fiscalización' : 'Transporte y Vialidad';
          }
        });
      }

      // 4. Establecer la vista predeterminada de su gerencia
      const subAreasSeguridad = ['serenazgo', 'fiscalizacion', 'transporte'];
      const mappedGerencia = subAreasSeguridad.includes(user.gerencia) ? 'seguridad' : user.gerencia;
      
      const vistaInicial = user.gerencia === 'municipal' ? 'riesgo' : mappedGerencia;
      setTimeout(() => showView(vistaInicial), 50);
      
      // Asegurar que el feed de WS recargue lo correcto (aquí SÍ pasamos la gerencia real para que filtre)
      setTimeout(() => { if(window.switchWspGroup) window.switchWspGroup(user.gerencia); }, 100);

      // 5. Ocultar opciones de filtros e informes PDFs ajenos
      setTimeout(() => {
        // Dropdown de filtro en reportes
        const comboGrupo = document.getElementById('rpt-filtro-grupo');
        if (comboGrupo) {
          Array.from(comboGrupo.options).forEach(opt => {
            if (opt.value !== 'todos' && opt.value !== user.gerencia) {
              opt.remove();
            }
          });
          comboGrupo.value = user.gerencia;
        }

        // Botones "Generar Reporte" (PDF)
        document.querySelectorAll('button[onclick^="generateReportes"]').forEach(btn => {
          const onclick = btn.getAttribute('onclick');
          if (onclick.includes('general') || onclick.includes('completo')) {
            // Reemplazar el botón global del alcalde por el botón específico de la gerencia para el gerente
            btn.innerHTML = `📄 Generar Reporte ${user.gerencia.charAt(0).toUpperCase() + user.gerencia.slice(1)}`;
            btn.setAttribute('onclick', `generateReportesPdf('${user.gerencia}')`);
            btn.style.background = 'var(--blue)';
          } else if (!onclick.includes(`'${user.gerencia}'`)) {
            // Ocultar PDFs de otras gerencias
            const parent = btn.parentElement;
            if (parent) parent.style.display = 'none';
          }
        });

        // 6. Ocultar tarjetas de otras gerencias en el Feed
        const subAreasSeguridadCheck = ['serenazgo', 'fiscalizacion', 'transporte'];
        const isSubAreaSeg = subAreasSeguridadCheck.includes(user.gerencia);
        const targetBtnId = isSubAreaSeg ? 'wsp-btn-seguridad' : `wsp-btn-${user.gerencia}`;
        
        document.querySelectorAll('.wsp-card').forEach(card => {
          const id = card.id;
          if (id !== targetBtnId) {
            card.style.display = 'none';
          }
        });

        if (isSubAreaSeg) {
          const segCard = document.getElementById('wsp-btn-seguridad');
          if (segCard) {
            segCard.querySelector('.wsp-card-name').textContent = user.gerencia.charAt(0).toUpperCase() + user.gerencia.slice(1);
            segCard.setAttribute('onclick', `switchWspGroup('${user.gerencia}')`);
          }
        }
        
        // 7. Ocultar pestañas de Conexión y Mantenimiento (Solo Admin)
        document.querySelectorAll('#tabs-whatsapp .tab').forEach(tab => {
          const onclick = tab.getAttribute('onclick') || '';
          if (onclick.includes("'conexion'") || onclick.includes("'mantenimiento'")) {
            tab.style.display = 'none';
          }
        });
        
        // También ocultar títulos vacíos
        document.querySelectorAll('div').forEach(el => {
           if(el.textContent === 'POR GERENTE (Detallado)' && el.nextElementSibling) {
              // si todos los hijos están ocultos, podríamos ocultarlo
           }
        });
      }, 150);
    } else {
      setTimeout(() => showView('overview'), 50);
    }
  }

  logActivity('Sesión iniciada: ' + (user ? user.nombre : 'Usuario'));
}

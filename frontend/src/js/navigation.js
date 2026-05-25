// ===== SGTI Municipal — Navigation =====
import { logActivity } from './activity.js';
import { createChartsFor, buildHeatmap, buildCoverageBars } from './charts.js';
import { initMap, initMapWsp, initMapBenef, initMapHeat } from './maps.js';
import { renderWspFeed, currentWspGroup } from './whatsapp.js';

const viewTitles = { overview: 'Vista General del Alcalde', whatsapp: 'Central WhatsApp', seguridad: 'Seguridad Ciudadana', ambiental: 'Desarrollo Ambiental', rentas: 'Rentas', urbano: 'Desarrollo Urbano', riesgo: 'Gestión del Riesgo', humano: 'Desarrollo Humano', participacion: 'Participación Vecinal', mapa: 'Mapa Territorial', mapadecalor: 'Mapa de Calor', actividad: 'Log de Actividad', equipo: 'Gestión de Equipo' };
const viewBreadcrumbs = { overview: 'Sistema de Gestión Territorial', whatsapp: 'Información de Campo', seguridad: 'Gerencia de Seguridad', ambiental: 'Gerencia Ambiental', rentas: 'Gerencia de Rentas', urbano: 'Gerencia Urbano', riesgo: 'Gerencia Municipal', humano: 'Gerencia de Desarrollo Humano', participacion: 'Subgerencia de Participación Vecinal', mapa: 'Herramientas', mapadecalor: 'Herramientas', actividad: 'Herramientas', equipo: 'Herramientas' };

export function showView(view, tab) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById('view-' + view);
  if (targetView) targetView.classList.add('active');
  
  document.getElementById('view-title').textContent = viewTitles[view] || 'Sistema de Gestión';
  document.getElementById('breadcrumb').textContent = viewBreadcrumbs[view] || 'Herramientas';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll(`.nav-item[data-view="${view}"]`).forEach(n => n.classList.add('active'));

  if (view === 'mapa') {
    setTimeout(() => {
      const map = initMap();
      if (map) setTimeout(() => map.invalidateSize(), 200);
    }, 100);
  }
  
  if (view === 'mapadecalor') {
    setTimeout(() => {
      const mapH = initMapHeat();
      if (mapH) setTimeout(() => mapH.invalidateSize(), 200);
    }, 100);
  }
  
  if (view === 'whatsapp') setTimeout(initMapWsp, 100);
  if (view === 'humano') setTimeout(initMapBenef, 200);
  if (view === 'seguridad') setTimeout(buildHeatmap, 100);
  if (view === 'ambiental' || view === 'humano') setTimeout(buildCoverageBars, 100);
  if (view === 'equipo') {
    if (window.renderEquipoList) window.renderEquipoList();
  }
  
  if (tab) setTimeout(() => switchTab(view, tab), 50);
  else setTimeout(() => createChartsFor(view), 250); // Un poco más de delay para Chart.js
  
  logActivity('Vista: ' + viewTitles[view]);
}

export function toggleGerencia(el) {
  el.classList.toggle('open');
  const sub = el.nextElementSibling;
  if (sub) sub.classList.toggle('collapsed');
}

export function switchTab(view, tab) {
  const tabsEl = document.getElementById('tabs-' + view);
  if (!tabsEl) return;
  tabsEl.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll(`#view-${view} .tab-content`).forEach(tc => tc.classList.remove('active'));
  const tc = document.getElementById(view + '-' + tab);
  if (tc) {
    tc.classList.add('active');
    const tabs = tabsEl.querySelectorAll('.tab');
    const idx = [...document.querySelectorAll(`#view-${view} .tab-content`)].indexOf(tc);
    if (tabs[idx]) tabs[idx].classList.add('active');
  }
  setTimeout(() => createChartsFor(view), 100);
  if (view === 'humano') setTimeout(buildCoverageBars, 100);
}

export function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const t = parseInt(el.dataset.count), f = el.dataset.format, dur = 700, st = performance.now();
    function u(now) {
      const p = Math.min((now - st) / dur, 1), e = 1 - Math.pow(1 - p, 3), c = Math.round(t * e);
      el.textContent = f || c.toLocaleString('es-PE');
      if (p < 1) requestAnimationFrame(u);
      else el.textContent = f || t.toLocaleString('es-PE');
    }
    requestAnimationFrame(u);
  });
}

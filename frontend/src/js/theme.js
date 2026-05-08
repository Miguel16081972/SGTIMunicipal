// ===== SGTI Municipal — Theme =====
import { logActivity } from './activity.js';

export function toggleTheme() {
  document.documentElement.classList.toggle('light-mode');
  logActivity('Tema cambiado a ' + (document.documentElement.classList.contains('light-mode') ? 'claro' : 'oscuro'));
}

export function updateClock() {
  const d = new Date();
  const el = document.getElementById('clock');
  if (el) {
    el.textContent = d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}

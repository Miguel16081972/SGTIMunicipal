// ===== SGTI Municipal — Notifications =====
import { logActivity } from './activity.js';

export function toggleNotifs() {
  document.getElementById('notif-dropdown').classList.toggle('show');
  logActivity('Panel de notificaciones abierto');
}

export function clearNotifs() {
  document.querySelectorAll('.notif-item.unread').forEach(n => n.classList.remove('unread'));
  document.getElementById('notif-count').textContent = '0';
  logActivity('Notificaciones marcadas como leídas');
}

export function setupNotifClickAway() {
  document.addEventListener('click', e => {
    if (!e.target.closest('.notif-wrap')) {
      document.getElementById('notif-dropdown').classList.remove('show');
    }
  });
}

// Compare mode
let compareMode = false;
export function toggleCompare() {
  compareMode = !compareMode;
  document.getElementById('btn-compare').classList.toggle('active');
  document.querySelectorAll('[id^="comp-"]').forEach(el => el.style.display = compareMode ? 'flex' : 'none');
  logActivity('Modo comparativo ' + (compareMode ? 'activado' : 'desactivado'));
}

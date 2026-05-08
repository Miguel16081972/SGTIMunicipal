// ===== SGTI Municipal — Activity Log =====
const activityData = [];

export function logActivity(text) {
  activityData.unshift({ time: new Date(), text });
  renderActivityLog();
}

export function renderActivityLog() {
  const el = document.getElementById('activity-log');
  if (!el) return;
  const colors = ['var(--blue)', 'var(--green)', 'var(--amber)', 'var(--purple)', 'var(--cyan)', 'var(--pink)'];
  el.innerHTML = activityData.slice(0, 50).map((a, i) =>
    `<div class="log-item"><div class="log-dot" style="background:${colors[i % colors.length]}"></div><div class="log-time">${a.time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div><div class="log-text">${a.text}</div></div>`
  ).join('');
}

export function seedActivityLog() {
  ['Sistema iniciado', 'Vista General cargada', 'Datos de campo sincronizados', '5 alertas activas detectadas', 'Mapa territorial listo'].forEach(t =>
    activityData.push({ time: new Date(Date.now() - Math.random() * 3600000), text: t })
  );
  activityData.sort((a, b) => b.time - a.time);
}

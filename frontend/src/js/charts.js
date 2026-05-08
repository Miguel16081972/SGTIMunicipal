// ===== SGTI Municipal — Charts =====
import { Chart } from 'chart.js/auto';

const chartOpts = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: 'easeOutQuart' },
  plugins: {
    legend: { labels: { color: '#8896b3', font: { size: 10, family: 'DM Sans' } } },
    tooltip: { backgroundColor: '#111a2d', borderColor: 'rgba(56,72,106,.4)', borderWidth: 1, cornerRadius: 8, padding: 8, titleFont: { family: 'DM Sans', size: 11 }, bodyFont: { family: 'DM Sans', size: 10 } }
  },
  scales: { x: { ticks: { color: '#5a6a8a', font: { size: 9 } }, grid: { color: 'rgba(56,72,106,.12)' } }, y: { ticks: { color: '#5a6a8a', font: { size: 9 } }, grid: { color: 'rgba(56,72,106,.12)' } } }
};

const doughnutOpts = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 700, easing: 'easeOutQuart' },
  plugins: { legend: { position: 'right', labels: { color: '#8896b3', font: { size: 10, family: 'DM Sans' }, padding: 10, usePointStyle: true, pointStyle: 'circle' } } }
};

const chartsCreated = {};

export async function createChartsFor(view) {
  const { api } = await import('./api.js');

  if (view === 'overview') {
    try {
      console.log('📊 Cargando estadísticas para el Dashboard...');
      const stats = await api.getWhatsappStats();
      console.log('📈 Datos recibidos:', stats);
      
      // 1. Chart por Gerencia
      const cg = document.getElementById('chart-gerencias');
      if (cg && cg.offsetParent !== null && !chartsCreated['chart-gerencias']) {
        const labels = stats.porGerencia.map(i => (i.area || 'OTRO').toUpperCase());
        const data = stats.porGerencia.map(i => i.total);
        
        chartsCreated['chart-gerencias'] = new Chart(cg, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Reportes por Área',
              data,
              backgroundColor: 'rgba(79, 143, 247, 0.3)',
              borderColor: '#4f8ff7',
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: chartOpts
        });
        console.log('✅ Gráfico de gerencias creado');
      }

      // 2. Chart por Estado
      const ce = document.getElementById('chart-estados');
      if (ce && ce.offsetParent !== null && !chartsCreated['chart-estados']) {
        const labels = stats.porEstado.map(i => (i.estado || 'NUEVO').toUpperCase());
        const data = stats.porEstado.map(i => i.total);
        
        chartsCreated['chart-estados'] = new Chart(ce, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: ['#4f8ff7', '#fbbf24', '#34d399', '#f87171', '#a78bfa'],
              borderWidth: 0
            }]
          },
          options: doughnutOpts
        });
        console.log('✅ Gráfico de estados creado');
      }

      // Actualizar contador
      const totalEl = document.getElementById('total-incidencias');
      if (totalEl) totalEl.textContent = stats.total.toLocaleString();

    } catch (err) {
      console.error('❌ Error en el Dashboard:', err);
    }
  }

  if (view === 'seguridad' && !chartsCreated['chart-serenazgo']) {
    const c = document.getElementById('chart-serenazgo');
    if (c && c.offsetParent !== null) {
      chartsCreated['chart-serenazgo'] = new Chart(c, { type: 'doughnut', data: { labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], datasets: [{ data: [12, 8, 23, 15, 10, 6], backgroundColor: ['#4f8ff7', '#22d3ee', '#f87171', '#fbbf24', '#34d399', '#a78bfa'], borderWidth: 0, hoverOffset: 5 }] }, options: { ...doughnutOpts, cutout: '62%' } });
    }
  }
  if (view === 'ambiental' && !chartsCreated['chart-ambiental']) {
    const c = document.getElementById('chart-ambiental');
    if (c && c.offsetParent !== null) {
      chartsCreated['chart-ambiental'] = new Chart(c, { type: 'bar', data: { labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], datasets: [{ label: 'Cobertura %', data: [85, 72, 65, 80, 78, 60], backgroundColor: 'rgba(52,211,153,.25)', borderColor: '#34d399', borderWidth: 1, borderRadius: 6 }] }, options: { ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } }, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, max: 100 } } } });
    }
  }
  if (view === 'rentas') {
    if (!chartsCreated['chart-recaudacion']) {
      const c = document.getElementById('chart-recaudacion');
      if (c && c.offsetParent !== null) {
        chartsCreated['chart-recaudacion'] = new Chart(c, { type: 'bar', data: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], datasets: [{ label: 'Recaudado', data: [52000, 48000, 61000, 48200, null, null], backgroundColor: 'rgba(251,191,36,.25)', borderColor: '#fbbf24', borderWidth: 1, borderRadius: 6 }, { label: 'Meta', data: [60000, 60000, 60000, 62000, 62000, 62000], type: 'line', borderColor: '#5a6a8a', borderDash: [5, 5], pointRadius: 0, fill: false }] }, options: chartOpts });
      }
    }
    if (!chartsCreated['chart-licencias']) {
      const c = document.getElementById('chart-licencias');
      if (c && c.offsetParent !== null) {
        chartsCreated['chart-licencias'] = new Chart(c, { type: 'line', data: { labels: ['Ene', 'Feb', 'Mar', 'Abr'], datasets: [{ label: 'Nuevas', data: [12, 15, 22, 18], borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,.06)', fill: true, tension: .4, pointRadius: 3 }, { label: 'Cerradas', data: [4, 3, 8, 6], borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,.06)', fill: true, tension: .4, pointRadius: 3 }] }, options: chartOpts });
      }
    }
    if (!chartsCreated['chart-rubros']) {
      const c = document.getElementById('chart-rubros');
      if (c && c.offsetParent !== null) {
        chartsCreated['chart-rubros'] = new Chart(c, { type: 'doughnut', data: { labels: ['Bodegas', 'Restaurantes', 'Farmacias', 'Talleres', 'Servicios', 'Bares', 'Otros'], datasets: [{ data: [78, 52, 34, 28, 45, 22, 125], backgroundColor: ['#fbbf24', '#f87171', '#34d399', '#fb923c', '#4f8ff7', '#a78bfa', '#5a6a8a'], borderWidth: 0, hoverOffset: 5 }] }, options: { ...doughnutOpts, cutout: '58%' } });
      }
    }
  }
  if (view === 'riesgo') {
    if (!chartsCreated['chart-riesgo']) {
      const c = document.getElementById('chart-riesgo');
      if (c && c.offsetParent !== null) {
        chartsCreated['chart-riesgo'] = new Chart(c, { type: 'bar', data: { labels: ['Ene', 'Feb', 'Mar', 'Abr'], datasets: [{ label: 'Aprobadas', data: [18, 22, 25, 22], backgroundColor: 'rgba(52,211,153,.25)', borderRadius: 5 }, { label: 'Observadas', data: [5, 8, 6, 6], backgroundColor: 'rgba(248,113,113,.25)', borderRadius: 5 }] }, options: { ...chartOpts, scales: { ...chartOpts.scales, x: { ...chartOpts.scales.x, stacked: true }, y: { ...chartOpts.scales.y, stacked: true } } } });
      }
    }
    if (!chartsCreated['chart-itsdc']) {
      const c = document.getElementById('chart-itsdc');
      if (c && c.offsetParent !== null) {
        chartsCreated['chart-itsdc'] = new Chart(c, { type: 'doughnut', data: { labels: ['Vigentes', 'Por vencer', 'Sin certificado'], datasets: [{ data: [327, 15, 42], backgroundColor: ['#34d399', '#fbbf24', '#f87171'], borderWidth: 0, hoverOffset: 5 }] }, options: { ...doughnutOpts, cutout: '58%' } });
      }
    }
  }
}

export function buildHeatmap() {
  const sectors = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'];
  const data = [[0,0,0,0,0,1,0,1,2,1,1,2,3,2,1,1,0,1,2,3,2,1,1,0],[0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0,0,0,1,1,1,0,0,0],[0,0,1,1,0,0,1,2,3,4,3,3,4,3,2,2,3,4,5,4,3,2,1,1],[0,0,0,0,0,0,1,1,2,2,1,2,2,1,1,1,1,2,3,2,2,1,0,0],[0,0,0,0,0,0,0,1,1,1,1,1,2,1,0,0,0,1,1,2,1,0,0,0],[0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0]];
  const labelsEl = document.getElementById('heatmap-labels');
  const gridEl = document.getElementById('heatmap-grid');
  if (!labelsEl || !gridEl) return;
  labelsEl.innerHTML = sectors.map(s => `<div style="font-size:9px;color:var(--text-muted);height:18px;display:flex;align-items:center">${s}</div>`).join('');
  gridEl.style.display = 'grid'; gridEl.style.gridTemplateColumns = 'repeat(24,1fr)'; gridEl.style.gap = '2px';
  gridEl.innerHTML = data.map((row, si) => row.map((v, h) => {
    const max = 5; const intensity = v / max;
    const bg = v === 0 ? 'var(--border-light)' : intensity < .3 ? 'rgba(52,211,153,.3)' : intensity < .6 ? 'rgba(251,191,36,.4)' : 'rgba(248,113,113,.' + Math.min(9, Math.round(intensity * 10)) + ')';
    return `<div class="heatmap-cell" style="background:${bg};height:18px" title="${sectors[si]} ${h}:00 — ${v} incid."></div>`;
  }).join('')).join('');
}

export function buildCoverageBars() {
  const el1 = document.getElementById('coverage-limpieza');
  if (el1) {
    const data = [{ s: 'Sector 1', v: 85 }, { s: 'Sector 2', v: 72 }, { s: 'Sector 3', v: 65 }, { s: 'Sector 4', v: 80 }, { s: 'Sector 5', v: 78 }, { s: 'Sector 6', v: 60 }];
    el1.innerHTML = data.map(d => { const c = d.v >= 80 ? 'var(--green)' : d.v >= 70 ? 'var(--amber)' : 'var(--red)'; return `<div class="coverage-bar"><div class="coverage-label">${d.s}</div><div class="coverage-track"><div class="coverage-fill" style="width:${d.v}%;background:${c}">${d.v}%</div></div><div class="coverage-pct" style="color:${c}">${d.v >= 80 ? '✓' : d.v >= 70 ? '!' : '✗'}</div></div>`; }).join('');
  }
  const el2 = document.getElementById('coverage-social');
  if (el2) {
    const data = [{ s: 'Sector 1', v: 88 }, { s: 'Sector 2', v: 82 }, { s: 'Sector 3', v: 94 }, { s: 'Sector 4', v: 76 }, { s: 'Sector 5', v: 68 }, { s: 'Sector 6', v: 71 }];
    el2.innerHTML = '<div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">% de familias objetivo cubiertas por al menos 1 programa</div>' + data.map(d => { const c = d.v >= 85 ? 'var(--green)' : d.v >= 75 ? 'var(--amber)' : 'var(--red)'; return `<div class="coverage-bar"><div class="coverage-label">${d.s}</div><div class="coverage-track"><div class="coverage-fill" style="width:${d.v}%;background:${c}">${d.v}%</div></div><div class="coverage-pct" style="color:${c}">${d.v < 75 ? '⚠ brecha' : ''}</div></div>`; }).join('');
  }
}

// ===== SGTI Municipal — Filters =====
import { logActivity } from './activity.js';

export function applyFilters() {
  const s = document.getElementById('filter-sector').value;
  logActivity('Filtro aplicado: ' + s + ' | ' + document.getElementById('filter-from').value + ' a ' + document.getElementById('filter-to').value);
  
  // Actualizar mapa principal si existe
  import('./maps.js').then(m => m.filterSectors(s)).catch(()=>{});

  // Si estamos en la vista de WhatsApp, actualizar reportes
  const content = document.getElementById('content');
  if (content && content.querySelector('#tabs-whatsapp')) {
    import('./whatsapp.js').then(m => m.refreshReportes()).catch(()=>{});
  }
}

export function resetFilters() {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  document.getElementById('filter-sector').value = 'all';
  document.getElementById('filter-from').value = formatDate(thirtyDaysAgo);
  document.getElementById('filter-to').value = formatDate(now);
  
  logActivity('Filtros reseteados');
  
  // Actualizar si es necesario
  applyFilters();
}

export function handleSearch(q) {
  if (!q) {
    document.querySelectorAll('.nav-item,.gerencia-toggle').forEach(el => el.style.opacity = '');
    return;
  }
  q = q.toLowerCase();
  document.querySelectorAll('.nav-item').forEach(el => {
    el.style.opacity = el.textContent.toLowerCase().includes(q) ? '1' : '.25';
  });
}

export async function exportCurrentTable() {
  const content = document.getElementById('content');
  const isWsp = content && content.querySelector('#tabs-whatsapp');
  
  if (isWsp) {
    try {
      // Para WhatsApp, obtenemos la data directamente de la API con los filtros actuales
      const api = (await import('./api.js')).default;
      const filters = {
         estado: document.getElementById('rpt-filtro-estado')?.value || 'todos',
         grupo: document.getElementById('rpt-filtro-grupo')?.value || 'todos',
         prioridad: document.getElementById('rpt-filtro-prioridad')?.value || 'todas',
         from: document.getElementById('filter-from')?.value,
         to: document.getElementById('filter-to')?.value
      };
      
      const { reportes } = await api.getWhatsappReportes(filters);
      
      if (!reportes || reportes.length === 0) {
        alert('No hay datos para exportar con los filtros actuales.');
        return;
      }
      
      // Formatear data para Excel
      const dataForExcel = reportes.map(r => ({
        ID: r.id,
        Fecha: new Date(r.fecha).toLocaleString('es-PE'),
        Grupo: r.grupo,
        Categoría: r.categoria,
        Mensaje: r.mensaje,
        Prioridad: r.prioridad,
        Estado: r.estado,
        Sector: r.sector,
        Ubicación: r.ubicacion,
        ReportadoPor: r.reportadoPor,
        Teléfono: r.telefono || ''
      }));
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      XLSX.utils.book_append_sheet(wb, ws, 'Reportes_WhatsApp');
      XLSX.writeFile(wb, 'SGTI_WhatsApp_' + new Date().toISOString().slice(0, 10) + '.xlsx');
      logActivity('Reportes WhatsApp exportados a Excel');
      return;
    } catch (e) {
      console.error(e);
      alert('Error exportando datos de WhatsApp.');
      return;
    }
  }

  // Comportamiento original para tablas HTML estándar
  const view = document.querySelector('.view.active');
  const table = view ? view.querySelector('.data-table') : null;
  if (!table) { alert('No hay tabla visible para exportar'); return; }
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, 'SGTI_Export_' + new Date().toISOString().slice(0, 10) + '.xlsx');
    logActivity('Tabla exportada a Excel');
  } catch (e) {
    alert('Error al exportar.');
  }
}

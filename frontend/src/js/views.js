// ===== SGTI Municipal — View Templates =====
import { currentWspGroup } from './whatsapp.js';

const filterOptions = `
  <option value="todos">Todas las Gerencias</option>
  <option value="municipal">Ger. Municipal</option>
  <option value="seguridad">Seg. Ciudadana</option>
  <option value="ambiental">Des. Ambiental</option>
  <option value="rentas">Rentas</option>
  <option value="urbano">Des. Urbano</option>
  <option value="humano">Des. Humano</option>
  <option value="participacion">Part. Vecinal</option>
  <option value="opc">OPC</option>
  <option value="demuna">DEMUNA</option>
  <option value="ciam">CIAM</option>
  <option value="omaped">OMAPED</option>
  <option value="otros">Otros</option>
`;

const wspGroups = `
  <div class="wsp-card" id="wsp-btn-municipal" onclick="switchWspGroup('municipal')"><div class="wsp-card-icon">🏢</div><div class="wsp-card-name">Ger. Municipal</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-municipal">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-seguridad" onclick="switchWspGroup('seguridad')"><div class="wsp-card-icon">👮</div><div class="wsp-card-name">Seg. Ciudadana</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-seguridad">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-ambiental" onclick="switchWspGroup('ambiental')"><div class="wsp-card-icon">🍃</div><div class="wsp-card-name">Des. Ambiental</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-ambiental">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-rentas" onclick="switchWspGroup('rentas')"><div class="wsp-card-icon">💰</div><div class="wsp-card-name">Rentas</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-rentas">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-urbano" onclick="switchWspGroup('urbano')"><div class="wsp-card-icon">🏗️</div><div class="wsp-card-name">Des. Urbano</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-urbano">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-humano" onclick="switchWspGroup('humano')"><div class="wsp-card-icon">👥</div><div class="wsp-card-name">Des. Humano</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-humano">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-participacion" onclick="switchWspGroup('participacion')"><div class="wsp-card-icon">🤝</div><div class="wsp-card-name">Part. Vecinal</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-participacion">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-opc" onclick="switchWspGroup('opc')"><div class="wsp-card-icon">🏛️</div><div class="wsp-card-name">OPC</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-opc">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-demuna" onclick="switchWspGroup('demuna')"><div class="wsp-card-icon">⚖️</div><div class="wsp-card-name">DEMUNA</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-demuna">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-ciam" onclick="switchWspGroup('ciam')"><div class="wsp-card-icon">👴</div><div class="wsp-card-name">CIAM</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-ciam">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-omaped" onclick="switchWspGroup('omaped')"><div class="wsp-card-icon">♿</div><div class="wsp-card-name">OMAPED</div><div class="status-pill status-active">Activo</div><div class="wsp-card-info" id="wsp-count-omaped">0 msg</div></div>
  <div class="wsp-card" id="wsp-btn-otros" onclick="switchWspGroup('otros')"><div class="wsp-card-icon">❓</div><div class="wsp-card-name">Otros</div><div class="status-pill status-inactive">Inactivo</div><div class="wsp-card-info" id="wsp-count-otros">0 msg</div></div>
`;

const adminPdf = `
  <div style="margin-bottom:10px;">
    <button class="btn btn-primary" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="generateReportesPdf('general')">
      🚀 Enviar Reporte al Alcalde
    </button>
  </div>
`;

const gerentesPdf = `
  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:8px;">
    <span style="font-size:11px; display:flex; align-items:center; gap:6px;">🏢 Municipal</span>
    <button class="btn btn-ghost" style="padding:2px 8px; font-size:9px;" onclick="generateReportesPdf('municipal')">Generar →</button>
  </div>
  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:8px;">
    <span style="font-size:11px; display:flex; align-items:center; gap:6px;">🛡️ Seguridad</span>
    <button class="btn btn-ghost" style="padding:2px 8px; font-size:9px;" onclick="generateReportesPdf('seguridad')">Generar →</button>
  </div>
  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:8px;">
    <span style="font-size:11px; display:flex; align-items:center; gap:6px;">🌿 Ambiental</span>
    <button class="btn btn-ghost" style="padding:2px 8px; font-size:9px;" onclick="generateReportesPdf('ambiental')">Generar →</button>
  </div>
  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:8px;">
    <span style="font-size:11px; display:flex; align-items:center; gap:6px;">💰 Rentas</span>
    <button class="btn btn-ghost" style="padding:2px 8px; font-size:9px;" onclick="generateReportesPdf('rentas')">Generar →</button>
  </div>
  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:8px;">
    <span style="font-size:11px; display:flex; align-items:center; gap:6px;">🏗️ Urbano</span>
    <button class="btn btn-ghost" style="padding:2px 8px; font-size:9px;" onclick="generateReportesPdf('urbano')">Generar →</button>
  </div>
  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:8px;">
    <span style="font-size:11px; display:flex; align-items:center; gap:6px;">⚖️ Humano</span>
    <button class="btn btn-ghost" style="padding:2px 8px; font-size:9px;" onclick="generateReportesPdf('humano')">Generar →</button>
  </div>
  <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:8px;">
    <span style="font-size:11px; display:flex; align-items:center; gap:6px;">🤝 Participación</span>
    <button class="btn btn-ghost" style="padding:2px 8px; font-size:9px;" onclick="generateReportesPdf('participacion')">Generar →</button>
  </div>
`;

export const views = `
<!-- VISTA GENERAL (OVERVIEW) -->
<div class="view active" id="view-overview">
  <div class="gerencia-cards">
    <div class="card card-accent" style="border-left-color:var(--blue)"><div class="card-label">Incidencias Mes</div><div class="card-value" id="total-incidencias">0</div><div class="card-sub">Carga real</div></div>
    <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Atención Promedio</div><div class="card-value">18.5h</div><div class="card-sub">-2h mejora</div></div>
    <div class="card card-accent" style="border-left-color:var(--amber)"><div class="card-label">Eficiencia Operativa</div><div class="card-value">92%</div><div class="card-sub">KPI General</div></div>
    <div class="card card-accent" style="border-left-color:var(--red)"><div class="card-label">Casos Críticos</div><div class="card-value">14</div><div class="card-sub">Atención urgente</div></div>
  </div>
  <div class="two-col" style="gap:20px; margin-top:20px;">
    <div class="chart-container" style="background:var(--card); padding:20px; border-radius:12px; height:320px; overflow:hidden;">
      <div class="chart-title" style="margin-bottom:15px; font-weight:600; color:var(--text-dim)">📊 Incidencias por Gerencia</div>
      <div style="height:230px; position:relative;"><canvas id="chart-gerencias"></canvas></div>
    </div>
    <div class="chart-container" style="background:var(--card); padding:20px; border-radius:12px; height:320px; overflow:hidden;">
      <div class="chart-title" style="margin-bottom:15px; font-weight:600; color:var(--text-dim)">🌓 Estado de Reportes</div>
      <div style="height:230px; position:relative;"><canvas id="chart-estados"></canvas></div>
    </div>
  </div>
</div>

<!-- WHATSAPP -->
<div class="view" id="view-whatsapp">
  <div class="tabs" id="tabs-whatsapp">
    <div class="tab active" onclick="switchWspTab('feed')">📡 Feed en Vivo</div>
    <div class="tab" onclick="switchWspTab('reportes')">📋 Reportes <span class="badge badge-red" id="reportes-badge" style="margin-left:4px">0</span></div>
    <div class="tab" onclick="switchWspTab('conexion')">⚙️ Conexión</div>
    <div class="tab" onclick="switchWspTab('mantenimiento')">🧹 Mantenimiento</div>
  </div>

  <!-- TAB: FEED -->
  <div class="tab-content active" id="wsp-tab-feed">
    <div class="section-title"><span class="st-dot" style="background:var(--green)"></span> Temas Tendencia (últimas 24h)</div>
    <div class="trending" id="wsp-trending"></div>
    
    <div class="section-title"><span class="st-dot" style="background:var(--green)"></span> Grupos Activos</div>
    <div class="wsp-grid">${wspGroups}</div>
    
    <div class="wsp-central-layout">
      <div class="wsp-content-col">
        <div class="section-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div><span class="st-dot" style="background:var(--blue)"></span> <span id="wsp-feed-title">Feed - Gerencia Municipal</span></div>
          <select id="feed-filtro-subarea" class="filter-select" style="font-size:10px; padding:4px; max-width:110px;" onchange="window.renderWspFeed(window.currentWspGroup)">
            <option value="todos">Todas las áreas</option>
            <option value="serenazgo">Serenazgo</option>
            <option value="fiscalizacion">Fiscalización</option>
            <option value="transporte">Transporte</option>
          </select>
        </div>
        <div class="wsp-feed-col"><div class="feed" id="wsp-feed"></div></div>
      </div>
      <div class="wsp-map-col">
        <div class="section-title"><span class="st-dot" style="background:var(--red)"></span> Mapa de Intervenciones</div>
        <div id="map-wsp" class="map-container" style="height:calc(100vh - 340px)"></div>
      </div>
    </div>
  </div>

  <!-- TAB: REPORTES -->
  <div class="tab-content" id="wsp-tab-reportes">
    <h2 style="font-size:20px; margin-bottom:12px">Panel de Gestión de Incidencias</h2>
    <div id="reportes-kpis" class="gerencia-cards" style="margin-bottom:20px"></div>
    
    <div style="background:var(--card); border:1px solid var(--border-light); border-radius:12px; padding:16px;">
      <div class="reportes-filters" style="margin-bottom:16px; flex-wrap:nowrap">
         <select class="filter-select" id="rpt-filtro-estado" onchange="filtrarReportes()"><option value="todos">Estados</option><option value="nuevo">🔴 Nuevo</option><option value="en_proceso">🟡 Proceso</option><option value="atendido">🟢 Atendido</option></select>
         <select class="filter-select" id="rpt-filtro-grupo" onchange="filtrarReportes()">${filterOptions}</select>
         <select class="filter-select" id="rpt-filtro-prioridad" onchange="filtrarReportes()"><option value="todas">Prioridad</option><option value="Alta">🔴 Alta</option><option value="Media">🟡 Media</option><option value="Baja">🟢 Baja</option></select>
         <input type="text" class="filter-select" id="rpt-filtro-personal" placeholder="👤 Buscar personal..." oninput="filtrarReportes()" style="width:140px; padding:4px 8px; font-size:11px;">
         <button class="top-btn" onclick="refreshReportes()">🔄 Actualizar</button>
         <div style="flex:1"></div>
         <div style="display:flex; gap:10px;">${adminPdf}</div>
      </div>
      <div style="margin-bottom:8px; font-size:10px; color:var(--text-dim)">💡 Haz clic en cualquier fila para editar la ubicación y el estado del reporte.</div>
      <div id="reportes-lista"></div>
    </div>
  </div>

  <!-- TAB: CONEXION -->
  <div class="tab-content" id="wsp-tab-conexion">
    <div id="wsp-status-container" style="text-align:center;padding:40px;background:var(--card);border-radius:var(--radius);border:1px solid var(--border)">
      <div class="spinner"></div><p style="margin-top:20px;color:var(--text-dim)">Cargando estado...</p>
    </div>
  </div>

  <!-- TAB: MANTENIMIENTO -->
  <div class="tab-content" id="wsp-tab-mantenimiento">
    <div class="card" style="max-width:500px; margin:0 auto; padding:24px;">
      <h3 style="margin-bottom:12px">🧹 Depuración y Limpieza</h3>
      <div style="display:flex; gap:10px; margin-bottom:16px;">
        <select class="filter-select" id="mnt-mes" style="flex:1"><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04" selected>Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select>
        <select class="filter-select" id="mnt-anio" style="flex:1"><option value="2026" selected>2026</option><option value="2025">2025</option></select>
      </div>
      <button class="btn btn-primary" style="width:100%; margin-bottom:8px;" onclick="exportarMantenimiento()">⬇️ Descargar Backup CSV</button>
      <button class="btn btn-ghost" style="width:100%; margin-bottom:16px; border-color:var(--amber); color:var(--amber)" onclick="limpiarDemo()">🧹 Limpieza Total (Borrar Todo)</button>
      <div style="border-top:1px solid var(--border); padding-top:16px;">
        <label style="display:flex; align-items:center; gap:8px; font-size:10px; color:var(--red); cursor:pointer;"><input type="checkbox" id="mnt-confirm"> He descargado el respaldo y deseo limpiar estos datos.</label>
        <button class="btn btn-ghost" style="width:100%; margin-top:10px; color:var(--red); border-color:rgba(248,113,113,0.2)" onclick="limpiarMantenimiento()">🗑️ Ejecutar Limpieza</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="reporte-modal"><div class="modal" style="width:780px; max-height:90vh; overflow-y:auto"><div id="reporte-modal-content"></div><div class="modal-actions" style="margin-top:16px; position:sticky; bottom:0; background:var(--card-solid); padding:12px 0 0; border-top:1px solid var(--border-light)"><button class="btn btn-ghost" onclick="cerrarReporteModal()">Cerrar</button></div></div></div>
</div>

<!-- MAPA TERRITORIAL -->
<div class="view" id="view-mapa">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
    <div class="section-title" style="margin:0;"><span class="st-dot" style="background:var(--red)"></span> Monitoreo Territorial en Tiempo Real</div>
    <div id="map-layer-btns" style="display:flex; gap:8px;"></div>
  </div>
  <div id="map-main" class="map-container" style="height:calc(100vh - 200px); border-radius:12px; position:relative;"></div>
</div>

<!-- MAPA DE CALOR -->
<div class="view" id="view-mapadecalor">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
    <div class="section-title" style="margin:0;"><span class="st-dot" style="background:var(--amber)"></span> Mapa de Calor de Incidencias Georeferenciadas</div>
    <div style="display:flex; gap:8px; align-items:center;">
      <span style="font-size:11px; color:var(--text-muted); font-weight:600;">Filtrar por Grupo:</span>
      <select id="heat-filtro-grupo" class="filter-select" onchange="window.actualizarMapaCalor()" style="padding:4px 8px; font-size:11px; min-width:160px; height:32px;">
        <option value="todos">Todos los grupos</option>
        <option value="seguridad">Seguridad Ciudadana</option>
        <option value="ambiental">Desarrollo Ambiental</option>
        <option value="rentas">Rentas / Eco</option>
        <option value="urbano">Desarrollo Urbano</option>
        <option value="humano">Desarrollo Humano</option>
      </select>
    </div>
  </div>
  <div id="map-heat" class="map-container" style="height:calc(100vh - 200px); border-radius:12px; position:relative;"></div>
</div>

<!-- ACTIVIDAD -->
<div class="view" id="view-actividad">
  <div class="section-title"><span class="st-dot" style="background:var(--blue)"></span> Historial de Actividad del Sistema</div>
  <div id="activity-log" style="background:var(--card); border:1px solid var(--border-light); border-radius:12px; padding:20px; max-height:calc(100vh - 220px); overflow-y:auto;"></div>
</div>

<!-- SEGURIDAD -->
<div class="view" id="view-seguridad">
  <div class="tabs" id="tabs-seguridad"><div class="tab active" onclick="switchTab('seguridad','serenazgo')">Serenazgo</div><div class="tab" onclick="switchTab('seguridad','fiscalizacion')">Fiscalización</div></div>
  <div class="tab-content active" id="seguridad-serenazgo">
    <div class="cards-grid">
      <div class="card card-accent" style="border-left-color:var(--blue)"><div class="card-label">Incidencias Hoy</div><div class="card-value">18</div><div class="card-sub">6 pend., 12 atendidas</div></div>
      <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Tiempo Respuesta</div><div class="card-value">4:12</div><div class="card-sub">min. promedio</div></div>
    </div>
    <div class="section-title"><span class="st-dot" style="background:var(--blue)"></span> Incidencias por Sector</div>
    <div class="chart-container" style="margin-bottom:16px"><canvas id="chart-serenazgo" height="200"></canvas></div>
  </div>
</div>

<!-- AMBIENTAL -->
<div class="view" id="view-ambiental">
  <div class="cards-grid">
    <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Quejas Pendientes</div><div class="card-value" style="color:var(--amber)">8</div><div class="card-sub">3 críticas</div></div>
    <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Rutas Hoy</div><div class="card-value">6 <span style="font-size:13px;color:var(--text-dim)">/ 8</span></div><div class="card-sub">75% completadas</div></div>
  </div>
  <div class="section-title"><span class="st-dot" style="background:var(--green)"></span> Cobertura por Sector</div>
  <div class="chart-container" style="margin-bottom:16px"><canvas id="chart-ambiental" height="200"></canvas></div>
</div>

<!-- RENTAS -->
<div class="view" id="view-rentas">
  <div class="tabs" id="tabs-rentas"><div class="tab active" onclick="switchTab('rentas','recaudacion')">Recaudación</div><div class="tab" onclick="switchTab('rentas','fisc-tributaria')">Fisc. Tributaria</div></div>
  <div class="tab-content active" id="rentas-recaudacion">
    <div class="cards-grid">
      <div class="card card-accent" style="border-left-color:var(--amber)"><div class="card-label">Recaudación Abril</div><div class="card-value">S/ 48,200</div><div class="card-sub">Meta: 78%</div></div>
      <div class="card card-accent" style="border-left-color:var(--red)"><div class="card-label">Morosidad</div><div class="card-value">23%</div><div class="card-sub">Prom. Distrital</div></div>
    </div>
    <div class="chart-container"><canvas id="chart-recaudacion" height="200"></canvas></div>
  </div>
</div>

<!-- DESARROLLO URBANO -->
<div class="view" id="view-urbano">
  <div class="cards-grid">
    <div class="card card-accent" style="border-left-color:var(--orange)"><div class="card-label">Obras Activas</div><div class="card-value">5</div><div class="card-sub">En ejecución</div></div>
    <div class="card card-accent" style="border-left-color:var(--orange)"><div class="card-label">Permisos Mes</div><div class="card-value">12</div><div class="card-sub">Nuevos expedientes</div></div>
  </div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Obra</th><th>Avance</th><th>Estado</th></tr></thead><tbody><tr><td>Pistas Sector 2</td><td>75%</td><td><span class="badge badge-green">En plazo</span></td></tr><tr><td>Parque Sector 1</td><td>45%</td><td><span class="badge badge-amber">Retraso</span></td></tr></tbody></table></div>
</div>

<!-- RIESGO -->
<div class="view" id="view-riesgo">
  <div class="cards-grid">
    <div class="card card-accent" style="border-left-color:var(--red)"><div class="card-label">Sin ITSDC</div><div class="card-value">42</div><div class="card-sub">Negocios críticos</div></div>
    <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Inspecciones Abr</div><div class="card-value">28</div><div class="card-sub">Realizadas</div></div>
  </div>
  <div class="chart-container"><canvas id="chart-riesgo" height="180"></canvas></div>
</div>

<!-- HUMANO -->
<div class="view" id="view-humano">
  <div class="tabs" id="tabs-humano">
    <div class="tab active" onclick="switchTab('humano','participacion')">🤝 Participación Vecinal</div>
    <div class="tab" onclick="switchTab('humano','salud')">🩺 Salud</div>
    <div class="tab" onclick="switchTab('humano','educacion')">🎓 Educación</div>
  </div>

  <!-- TAB: PARTICIPACION VECINAL (DETALLADO) -->
  <div class="tab-content active" id="humano-participacion">
    <div class="section-title"><span class="st-dot" style="background:var(--purple)"></span> Gestión de Sub-Temas Participación Vecinal</div>
    <div class="gerencia-cards" style="grid-template-columns: repeat(4, 1fr);">
      <div class="card" style="border-top:3px solid var(--blue)">
        <div style="font-weight:700; font-size:12px; margin-bottom:8px">🏛️ OPC</div>
        <div style="font-size:22px; font-weight:800">12</div>
        <div style="font-size:9px; color:var(--text-dim)">Organizaciones sociales</div>
      </div>
      <div class="card" style="border-top:3px solid var(--red)">
        <div style="font-weight:700; font-size:12px; margin-bottom:8px">⚖️ DEMUNA</div>
        <div style="font-size:22px; font-weight:800">5</div>
        <div style="font-size:9px; color:var(--text-dim)">Casos activos</div>
      </div>
      <div class="card" style="border-top:3px solid var(--green)">
        <div style="font-weight:700; font-size:12px; margin-bottom:8px">👴 CIAM</div>
        <div style="font-size:22px; font-weight:800">145</div>
        <div style="font-size:9px; color:var(--text-dim)">Adultos mayores</div>
      </div>
      <div class="card" style="border-top:3px solid var(--amber)">
        <div style="font-weight:700; font-size:12px; margin-bottom:8px">♿ OMAPED</div>
        <div style="font-size:22px; font-weight:800">95</div>
        <div style="font-size:9px; color:var(--text-dim)">Personas inscritas</div>
      </div>
    </div>

    <div class="two-col" style="margin-top:20px">
       <div class="card" style="padding:20px;">
          <h4 style="color:var(--green); margin-bottom:12px; display:flex; align-items:center; gap:8px">💪 Fortalezas</h4>
          <ul style="font-size:11px; line-height:1.6; color:var(--text-dim); padding-left:16px;">
             <li>Alta convocatoria en el programa CIAM (Sector 1 y 2).</li>
             <li>Sincronización efectiva de reportes vía WhatsApp por OPC.</li>
             <li>Resolución rápida de consultas de OMAPED.</li>
          </ul>
       </div>
       <div class="card" style="padding:20px;">
          <h4 style="color:var(--red); margin-bottom:12px; display:flex; align-items:center; gap:8px">⚠️ Fallas y Brechas</h4>
          <ul style="font-size:11px; line-height:1.6; color:var(--text-dim); padding-left:16px;">
             <li>Baja respuesta en DEMUNA para el Sector 6.</li>
             <li>Falta de actualización de padrones en OMAPED Sector 4.</li>
             <li>Retraso en la entrega de canastas de Vaso de Leche.</li>
          </ul>
       </div>
    </div>

    <div class="card" style="margin-top:20px; padding:20px; border-left:4px solid var(--blue);">
       <h4 style="color:var(--blue); margin-bottom:12px;">🚀 Plan de Mejora Continua</h4>
       <p style="font-size:11px; color:var(--text-dim); line-height:1.5;">Se recomienda integrar brigadas móviles para DEMUNA en zonas periféricas y automatizar la actualización de beneficios mediante el sistema SGTI para reducir errores manuales en un 30% en el próximo trimestre.</p>
    </div>

    <div class="section-title" style="margin-top:24px"><span class="st-dot" style="background:var(--purple)"></span> Cobertura por Programas</div>
    <div id="coverage-social" class="chart-container" style="height:150px"></div>
  </div>

  <!-- TAB: SALUD -->
  <div class="tab-content" id="humano-salud">
    <div class="cards-grid">
      <div class="card card-accent" style="border-left-color:var(--purple)"><div class="card-label">Campañas Abr</div><div class="card-value">6</div><div class="card-sub">Realizadas</div></div>
      <div class="card card-accent" style="border-left-color:var(--purple)"><div class="card-label">Beneficiarios</div><div class="card-value">1,240</div><div class="card-sub">Personas</div></div>
    </div>
  </div>
</div>
  <!-- GESTIÓN DE EQUIPO -->
  <div class="view" id="view-equipo">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div class="section-title" style="margin:0;"><span class="st-dot" style="background:var(--blue)"></span> Gestión de Personal de Campo</div>
      <div class="badge badge-blue" id="equipo-count-badge" style="font-size:12px; padding:6px 12px">0 Usuarios Registrados</div>
    </div>

    <div class="two-col" style="grid-template-columns: 0.8fr 1.2fr; gap:20px;">
      <!-- Formulario Crear -->
      <div class="card glass" style="padding:24px;">
        <h4 style="margin-bottom:16px; display:flex; align-items:center; gap:8px">👤 Registrar Nuevo Personal</h4>
        <form id="form-crear-usuario" onsubmit="event.preventDefault(); crearUsuarioEquipo();">
          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:10px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">NOMBRE COMPLETO</label>
            <input type="text" id="eq-nombre" class="filter-select" style="width:100%; padding:10px;" placeholder="Ej: Juan Pérez" required>
          </div>
          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:10px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">USUARIO (Para la App Móvil)</label>
            <input type="text" id="eq-user" class="filter-select" style="width:100%; padding:10px;" placeholder="Ej: jperez" required>
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:10px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">CONTRASEÑA TEMPORAL</label>
            <input type="password" id="eq-pass" class="filter-select" style="width:100%; padding:10px;" placeholder="••••••••" required>
          </div>
          <!-- Campos dinámicos según rol -->
          <div id="eq-extra-fields"></div>
          
          <button type="submit" class="btn btn-primary" style="width:100%; height:44px; font-weight:700;">Crear y Dar Acceso →</button>
        </form>
        <div id="eq-msg" style="margin-top:12px; font-size:11px; text-align:center;"></div>
      </div>

      <!-- Lista de Personal -->
      <div class="card glass" style="padding:0; overflow:hidden;">
        <div style="padding:12px 16px; border-bottom:1px solid var(--border-light); background:rgba(0,0,0,0.02); display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <span style="font-weight:700; font-size:12px;">Personal Activo en Georeporte</span>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="eq-search" class="filter-select" placeholder="🔍 Buscar por nombre..." style="padding:4px 8px; font-size:11px; width:180px;" oninput="window.filtrarEquipo()">
            <select id="eq-filtro-subarea" class="filter-select" style="padding:4px 8px; font-size:11px; max-width:150px; display:none;" onchange="renderEquipoList()">
              <option value="todos">Todas las sub-áreas</option>
              <option value="serenazgo">Serenazgo</option>
              <option value="fiscalizacion">Fiscalización</option>
              <option value="transporte">Transporte</option>
            </select>
          </div>
        </div>
        <div id="equipo-lista-container" style="max-height:500px; overflow-y:auto;">
           <div class="spinner-container" style="padding:40px;"><div class="spinner"></div></div>
        </div>
      </div>
    </div>

    <!-- Panel de Supervisores por Turno -->
    <div class="card glass" style="padding:24px; margin-top:20px;" id="panel-supervisores-turno">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h4 style="margin:0; display:flex; align-items:center; gap:8px;">🕐 Designar Supervisor de Campo por Turno</h4>
        <span style="font-size:10px; color:var(--text-muted);">Cualquier personal u operador puede ser designado como Supervisor de Campo</span>
      </div>
      
      <!-- Formulario de Asignación -->
      <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end; margin-bottom:24px; padding:16px; border-radius:8px; background:rgba(0,0,0,0.02); border:1px dashed var(--border-light);">
        <div style="flex:2; min-width:250px;">
          <label style="display:block; font-size:10px; font-weight:700; margin-bottom:6px; color:var(--text-muted); text-transform:uppercase;">1. Seleccionar Personal (Operador / Supervisor)</label>
          <select id="sup-turno-personal" class="filter-select" style="width:100%; padding:10px; height:40px;">
            <option value="">(Cargando personal...)</option>
          </select>
        </div>
        <div style="flex:1; min-width:200px;">
          <label style="display:block; font-size:10px; font-weight:700; margin-bottom:6px; color:var(--text-muted); text-transform:uppercase;">2. Seleccionar Turno</label>
          <select id="sup-turno-tipo" class="filter-select" style="width:100%; padding:10px; height:40px;">
            <option value="supervisor_manana">🌅 Turno Mañana (06:00 — 14:00)</option>
            <option value="supervisor_tarde">☀️ Turno Tarde (14:00 — 22:00)</option>
            <option value="supervisor_noche">🌙 Turno Noche (22:00 — 06:00)</option>
          </select>
        </div>
        <div style="display:flex; align-items:center;">
          <button class="btn btn-primary" style="padding:10px 24px; font-weight:700; height:40px; display:flex; align-items:center; gap:6px;" onclick="guardarSupervisorTurnoUnico()">
            <span>💾 Asignar Turno</span>
          </button>
        </div>
      </div>

      <!-- Resumen de Asignaciones Actuales -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;" id="supervisores-turno-resumen">
        <!-- Turno Mañana -->
        <div style="padding:16px; border-radius:10px; border:1px solid var(--border-light); background:linear-gradient(135deg, rgba(255,183,77,0.08), rgba(255,183,77,0.02)); display:flex; align-items:center; gap:12px;">
          <span style="font-size:28px;">🌅</span>
          <div>
            <div style="font-weight:700; font-size:10px; color:var(--text-muted); letter-spacing:0.5px;">TURNO MAÑANA</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">06:00 — 14:00</div>
            <div id="resumen-sup-manana" style="font-weight:700; font-size:14px; color:var(--text-color); margin-top:6px;">(Sin asignar)</div>
          </div>
        </div>
        <!-- Turno Tarde -->
        <div style="padding:16px; border-radius:10px; border:1px solid var(--border-light); background:linear-gradient(135deg, rgba(66,165,245,0.08), rgba(66,165,245,0.02)); display:flex; align-items:center; gap:12px;">
          <span style="font-size:28px;">☀️</span>
          <div>
            <div style="font-weight:700; font-size:10px; color:var(--text-muted); letter-spacing:0.5px;">TURNO TARDE</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">14:00 — 22:00</div>
            <div id="resumen-sup-tarde" style="font-weight:700; font-size:14px; color:var(--text-color); margin-top:6px;">(Sin asignar)</div>
          </div>
        </div>
        <!-- Turno Noche -->
        <div style="padding:16px; border-radius:10px; border:1px solid var(--border-light); background:linear-gradient(135deg, rgba(69,39,160,0.08), rgba(69,39,160,0.02)); display:flex; align-items:center; gap:12px;">
          <span style="font-size:28px;">🌙</span>
          <div>
            <div style="font-weight:700; font-size:10px; color:var(--text-muted); letter-spacing:0.5px;">TURNO NOCHE</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">22:00 — 06:00</div>
            <div id="resumen-sup-noche" style="font-weight:700; font-size:14px; color:var(--text-color); margin-top:6px;">(Sin asignar)</div>
          </div>
        </div>
      </div>
      
      <div style="margin-top:16px; display:flex; justify-content:flex-end;">
        <span id="sup-turno-msg" style="font-size:12px; font-weight:600;"></span>
      </div>
    </div>
  </div>
</div>`;

export function renderViews() {
  const content = document.getElementById('content');
  if (content) content.innerHTML = views;
}

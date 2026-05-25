// ===== SGTI Municipal - Mock Data =====
// Datos simulados centralizados. Reemplazar con consultas a BD cuando esté conectada.

const overviewKPIs = {
  incidenciasHoy: { valor: 47, ayer: 42, variacion: '+12%' },
  licenciasActivas: { valor: 384, porVencer: 23, variacion: '+18' },
  beneficiariosAbr: { valor: 1240, campanas: 6, variacion: '+8%' },
  alertasActivas: { valor: 8, criticas: 3, variacion: '+3' },
};

const semaforo = [
  { sector: 'Sector 1', nivel: 'Medio', color: 'amber', incidencias: 5 },
  { sector: 'Sector 2', nivel: 'Bajo', color: 'green', incidencias: 2 },
  { sector: 'Sector 3', nivel: 'Alto', color: 'red', incidencias: 12 },
  { sector: 'Sector 4', nivel: 'Medio', color: 'amber', incidencias: 6 },
  { sector: 'Sector 5', nivel: 'Bajo', color: 'green', incidencias: 3 },
  { sector: 'Sector 6', nivel: 'Medio', color: 'amber', incidencias: 4 },
];

const alertas = [
  { tipo: 'critica', titulo: '🔴 Funcionario Express — Desarrollo Económico', cuerpo: 'Carlos Ríos aprueba licencias en promedio en 2.3 días. El promedio del equipo es 14 días. Se detectaron 8 aprobaciones sin inspección previa en marzo 2026.' },
  { tipo: 'critica', titulo: '🔴 Negocios sin ITSDC operando', cuerpo: '42 negocios con licencia activa no cuentan con certificado de Defensa Civil. Sector 3 concentra el 60% (25 negocios).' },
  { tipo: 'warning', titulo: '🟡 Zona con incidencias recurrentes', cuerpo: 'Cuadra 5-7 de Jr. Los Olivos: 12 reportes de basura acumulada en los últimos 14 días.' },
  { tipo: 'warning', titulo: '🟡 Licencias por vencer sin renovación', cuerpo: '23 licencias vencen en abril. Solo 4 han iniciado trámite de renovación.' },
];

const gerencias = [
  { id: 'seguridad', nombre: 'Seguridad Ciudadana', icon: '🛡️', subs: 'Serenazgo · Fiscalización', color: 'blue', stats: [{ valor: 23, label: 'Incidencias' }, { valor: '4:12', label: 'Resp.' }, { valor: '89%', label: 'Atendidos' }] },
  { id: 'ambiental', nombre: 'Desarrollo Ambiental', icon: '🌿', subs: 'Limpieza Pública', color: 'green', stats: [{ valor: 8, label: 'Quejas' }, { valor: '6/8', label: 'Rutas' }, { valor: '78%', label: 'Cobertura' }] },
  { id: 'rentas', nombre: 'Rentas', icon: '💰', subs: 'Recaudación · Fisc. Tributaria', color: 'amber', stats: [{ valor: 384, label: 'Licencias' }, { valor: 67, label: 'Morosos' }, { valor: 'S/48K', label: 'Recaudado' }] },
  { id: 'urbano', nombre: 'Desarrollo Urbano', icon: '🏗️', subs: 'Obras y Catastro', color: 'orange', stats: [{ valor: 5, label: 'Obras' }, { valor: 12, label: 'Permisos' }, { valor: '2,847', label: 'Predios' }] },
  { id: 'riesgo', nombre: 'Gestión del Riesgo', icon: '⚠️', subs: 'Defensa Civil · ITSDC', color: 'red', stats: [{ valor: 42, label: 'Sin cert.' }, { valor: 15, label: 'Por vencer' }, { valor: 327, label: 'Vigentes' }] },
  { id: 'humano', nombre: 'Desarrollo Humano', icon: '👥', subs: 'Participación · Salud · Educación', color: 'purple', stats: [{ valor: '1,240', label: 'Beneficiarios' }, { valor: 6, label: 'Campañas' }, { valor: 4, label: 'Programas' }] },
];

const notificaciones = [
  { id: 1, titulo: '🔴 Funcionario Express detectado', detalle: 'C. Ríos: 8 licencias en 2.3 días prom.', tiempo: 'Hace 12 min', leida: false, tipo: 'red' },
  { id: 2, titulo: '🔴 42 negocios sin ITSDC', detalle: 'Sector 3 concentra 60%', tiempo: 'Hace 28 min', leida: false, tipo: 'red' },
  { id: 3, titulo: '🟡 Zona caliente Sector 3', detalle: '7 incidencias de seguridad hoy', tiempo: 'Hace 1h', leida: false, tipo: 'amber' },
  { id: 4, titulo: '🟡 Basura acumulada recurrente', detalle: 'Jr. Los Olivos cdra 5-7: 12 reportes', tiempo: 'Hace 2h', leida: false, tipo: 'amber' },
  { id: 5, titulo: '📋 23 licencias por vencer', detalle: 'Solo 4 iniciaron renovación', tiempo: 'Hace 4h', leida: true, tipo: 'gray' },
];

// ===== SEGURIDAD =====
const seguridadSerenazgo = {
  kpis: {
    incidenciasHoy: { valor: 18, pendientes: 6, atendidas: 12 },
    tiempoRespuesta: { valor: '4:12', unidad: 'min. promedio' },
    patrullas: { activas: 6, total: 8 },
    zonaCaliente: { sector: 'Sector 3', incidencias: 7 },
  },
  heatmap: {
    sectors: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'],
    data: [
      [0,0,0,0,0,1,0,1,2,1,1,2,3,2,1,1,0,1,2,3,2,1,1,0],
      [0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0,0,0,1,1,1,0,0,0],
      [0,0,1,1,0,0,1,2,3,4,3,3,4,3,2,2,3,4,5,4,3,2,1,1],
      [0,0,0,0,0,0,1,1,2,2,1,2,2,1,1,1,1,2,3,2,2,1,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,2,1,0,0,0,1,1,2,1,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0],
    ],
  },
  chartIncidencias: { labels: ['S1','S2','S3','S4','S5','S6'], data: [12,8,23,15,10,6] },
};

const seguridadFiscalizacion = {
  kpis: {
    operativos: { valor: 14, estaSemana: 3 },
    clausuras: { valor: 7, reincidencia: 4 },
    multas: { valor: 23, monto: 'S/ 34,500' },
    cumplimiento: { valor: '72%', label: 'en regla' },
  },
  operativos: [
    { fecha: '05 Abr', zona: 'Sector 3 - Av. Colonial', tipo: 'Operativo nocturno', negocios: 8, resultado: '3 clausurados', resultadoTipo: 'red' },
    { fecha: '03 Abr', zona: 'Sector 1 - Jr. Los Olivos', tipo: 'Fisc. comercial', negocios: 12, resultado: '5 notificados', resultadoTipo: 'amber' },
    { fecha: '01 Abr', zona: 'Sector 5 - Av. Argentina', tipo: 'Control ambulantes', negocios: 15, resultado: '8 retirados', resultadoTipo: 'amber' },
    { fecha: '28 Mar', zona: 'Sector 2 - Av. Venezuela', tipo: 'Operativo conjunto', negocios: 6, resultado: '2 clausurados', resultadoTipo: 'red' },
  ],
};

// ===== AMBIENTAL =====
const ambiental = {
  kpis: {
    quejas: { valor: 8, criticas: 3 },
    rutas: { completadas: 6, total: 8 },
    toneladas: { valor: 12.4, promedio: 11.2 },
    areasVerdes: { valor: 18, tipo: 'parques' },
  },
  chartCobertura: { labels: ['S1','S2','S3','S4','S5','S6'], data: [85,72,65,80,78,60] },
  brechas: [
    { sector: 'Sector 1', valor: 85 },
    { sector: 'Sector 2', valor: 72 },
    { sector: 'Sector 3', valor: 65 },
    { sector: 'Sector 4', valor: 80 },
    { sector: 'Sector 5', valor: 78 },
    { sector: 'Sector 6', valor: 60 },
  ],
};

// ===== RENTAS =====
const rentasRecaudacion = {
  kpis: {
    recaudacion: { valor: 'S/ 48,200', meta: 'S/ 62,000', porcentaje: '78%' },
    deuda: { valor: 'S/ 284K', morosos: 67 },
    prediosAlDia: { valor: '73%', alDia: 2078, total: 2847 },
    coactivas: { valor: 34, monto: 'S/ 89,000' },
  },
  chartRecaudacion: {
    labels: ['Ene','Feb','Mar','Abr','May','Jun'],
    recaudado: [52000,48000,61000,48200,null,null],
    meta: [60000,60000,60000,62000,62000,62000],
  },
};

const rentasFiscTributaria = {
  kpis: {
    sinLicencia: { valor: 58, label: 'operando' },
    notificaciones: { valor: 42, label: 'este mes' },
    regularizados: { valor: 15, porcentaje: '36%' },
  },
  informales: [
    { negocio: 'Taller "Rápido"', direccion: 'Jr. Huáscar 456', rubro: 'Taller', sector: 'Sector 4', estado: 'Sin licencia', estadoTipo: 'red' },
    { negocio: 'Bodega "Doña María"', direccion: 'Calle Tacna 123', rubro: 'Bodega', sector: 'Sector 2', estado: 'Notificado', estadoTipo: 'amber' },
    { negocio: 'Bar "La Esquina"', direccion: 'Av. Colonial 890', rubro: 'Bar', sector: 'Sector 3', estado: 'Zona resid.', estadoTipo: 'red' },
    { negocio: 'Peluquería "Estilo"', direccion: 'Jr. Los Olivos 567', rubro: 'Peluquería', sector: 'Sector 1', estado: 'Regularizado', estadoTipo: 'green' },
  ],
};

const rentasDesarrolloEco = {
  kpis: {
    licencias: { valor: 384, nuevasAbril: 18 },
    porVencer: { valor: 23, dias: 30 },
    rubroTop: { nombre: 'Bodegas', cantidad: 78, porcentaje: '20%' },
  },
  funnel: [
    { label: 'Solicitudes recibidas', valor: 45, porcentaje: 100, color: 'blue' },
    { label: 'Inspección programada', valor: 37, porcentaje: 82, color: 'cyan' },
    { label: 'Inspección completada', valor: 29, porcentaje: 64, color: 'amber' },
    { label: 'Licencia aprobada', valor: 20, porcentaje: 44, color: 'green' },
    { label: 'Licencia emitida', valor: 18, porcentaje: 40, color: 'green' },
  ],
  alertasCorrupcion: [
    { tipo: 'critica', titulo: '🔴 Patrón: Funcionario Express', cuerpo: 'Carlos Ríos aprobó 8 licencias en marzo con tiempo promedio de 2.3 días. El equipo promedia 14 días. Ninguna tuvo inspección previa.' },
    { tipo: 'warning', titulo: '🟡 Patrón: Negocio que reabre', cuerpo: 'Bar "La Noche" clausurado 2/mar, nueva licencia 10/mar (8 días). Aprobado por C. Ríos.' },
  ],
  chartLicencias: { labels: ['Ene','Feb','Mar','Abr'], nuevas: [12,15,22,18], cerradas: [4,3,8,6] },
  chartRubros: { labels: ['Bodegas','Restaurantes','Farmacias','Talleres','Servicios','Bares','Otros'], data: [78,52,34,28,45,22,125] },
};

// ===== URBANO =====
const urbano = {
  kpis: {
    obras: { valor: 5, porIniciar: 2 },
    permisos: { valor: 12, periodo: 'este trimestre' },
    predios: { valor: '2,847', estimado: '~3,500' },
    informales: { valor: 14, label: 'sin permiso' },
  },
  obras: [
    { nombre: 'Pistas y veredas S2', ubicacion: 'Jr. Venezuela cdra 3-6', avance: 75, plazo: 'May 2026', estado: 'En plazo', estadoTipo: 'green' },
    { nombre: 'Parque central', ubicacion: 'S1 - Plaza Principal', avance: 45, plazo: 'Jun 2026', estado: 'Retraso', estadoTipo: 'amber' },
    { nombre: 'Muro contención', ubicacion: 'S6 - Ribera del río', avance: 90, plazo: 'Abr 2026', estado: 'Por culminar', estadoTipo: 'green' },
    { nombre: 'Losa deportiva', ubicacion: 'S4 - AA.HH. Los Pinos', avance: 20, plazo: 'Jul 2026', estado: 'Iniciando', estadoTipo: 'blue' },
    { nombre: 'Alumbrado', ubicacion: 'Av. Argentina cdra 1-8', avance: 60, plazo: 'May 2026', estado: 'En plazo', estadoTipo: 'green' },
  ],
};

// ===== RIESGO =====
const riesgo = {
  kpis: {
    sinITSDC: { valor: 42, label: 'licencia activa' },
    porVencer: { valor: 15, dias: 30 },
    inspecciones: { valor: 28, aprobadas: 22, observadas: 6 },
    zonasRiesgo: { valor: 3, zonas: 'ribera, industrial, mercado' },
  },
  matrizRiesgo: {
    altaProb: [
      { ubicacion: 'Mercado', detalle: 'hacinamiento', nivel: 'med' },
      { ubicacion: 'Industrial', detalle: 'mat. peligrosos', nivel: 'high' },
      { ubicacion: 'Ribera', detalle: 'inundación', nivel: 'critical' },
    ],
    mediaProb: [
      { ubicacion: 'S5 - Parque', detalle: 'vandalismo', nivel: 'low' },
      { ubicacion: 'S3 - Av. Colonial', detalle: 'accidentes', nivel: 'med' },
      { ubicacion: 'S6 - Muro', detalle: 'derrumbe', nivel: 'high' },
    ],
    bajaProb: [
      { ubicacion: 'S1 - Plaza', detalle: 'aglomeración', nivel: 'low' },
      { ubicacion: 'S2 - Losa', detalle: 'uso nocturno', nivel: 'low' },
      { ubicacion: 'S4 - AA.HH.', detalle: 'incendio', nivel: 'med' },
    ],
  },
  alerta: { titulo: '🔴 Cruce: Licencia activa sin Defensa Civil', cuerpo: '42 negocios con licencia vigente sin certificado ITSDC. Sector 3 (25), Sector 1 (10), Sector 5 (7).' },
  inspecciones: [
    { fecha: '05 Abr', negocio: 'Rest. "Mar y Tierra"', direccion: 'Av. Colonial 234', inspector: 'P. Huamán', resultado: 'Aprobado', resultadoTipo: 'green' },
    { fecha: '04 Abr', negocio: 'Taller "AutoFix"', direccion: 'Jr. Huáscar 678', inspector: 'P. Huamán', resultado: 'Observado', resultadoTipo: 'red' },
    { fecha: '04 Abr', negocio: 'Minimarket "Don José"', direccion: 'Calle Grau 456', inspector: 'R. Sánchez', resultado: 'Aprobado', resultadoTipo: 'green' },
    { fecha: '03 Abr', negocio: 'Botica "Farma Salud"', direccion: 'Av. Argentina 890', inspector: 'R. Sánchez', resultado: 'Aprobado', resultadoTipo: 'green' },
    { fecha: '02 Abr', negocio: 'Bar "Noches Limeñas"', direccion: 'Jr. Los Olivos 345', inspector: 'P. Huamán', resultado: 'Observado', resultadoTipo: 'red' },
  ],
  chartInspecciones: { labels: ['Ene','Feb','Mar','Abr'], aprobadas: [18,22,25,22], observadas: [5,8,6,6] },
  chartITSDC: { labels: ['Vigentes','Por vencer','Sin certificado'], data: [327,15,42] },
};

// ===== HUMANO =====
const humano = {
  participacion: {
    kpis: {
      juntas: { valor: 12, label: 'activas' },
      solicitudes: { valor: 34, pendientes: 8 },
      programas: { valor: 4, lista: 'VdL, Comedor, CIAM, OMAPED' },
    },
    coberturaSocial: [
      { sector: 'Sector 1', valor: 88 },
      { sector: 'Sector 2', valor: 82 },
      { sector: 'Sector 3', valor: 94 },
      { sector: 'Sector 4', valor: 76 },
      { sector: 'Sector 5', valor: 68 },
      { sector: 'Sector 6', valor: 71 },
    ],
    programas: [
      { nombre: 'Vaso de Leche', beneficiarios: '680 familias', sectores: 'Todos', cobertura: '92%', estado: 'Activo' },
      { nombre: 'Comedor Popular', beneficiarios: '320 personas', sectores: 'S3, S4, S6', cobertura: '78%', estado: 'Activo' },
      { nombre: 'CIAM', beneficiarios: '145 personas', sectores: 'S1, S2', cobertura: '65%', estado: 'Activo' },
      { nombre: 'OMAPED', beneficiarios: '95 personas', sectores: 'Todos', cobertura: '71%', estado: 'Activo' },
    ],
    mapaBeneficiados: [
      { lat: -12.0418, lng: -77.0935, programa: 'Vaso de Leche', familias: 12, color: '#a78bfa' },
      { lat: -12.0425, lng: -77.0948, programa: 'Vaso de Leche', familias: 18, color: '#a78bfa' },
      { lat: -12.0440, lng: -77.0960, programa: 'Comedor', familias: 25, color: '#f472b6' },
      { lat: -12.0412, lng: -77.0972, programa: 'Vaso de Leche', familias: 15, color: '#a78bfa' },
      { lat: -12.0455, lng: -77.0940, programa: 'CIAM', familias: 8, color: '#22d3ee' },
      { lat: -12.0432, lng: -77.0985, programa: 'Vaso de Leche', familias: 22, color: '#a78bfa' },
      { lat: -12.0448, lng: -77.0970, programa: 'OMAPED', familias: 6, color: '#4f8ff7' },
      { lat: -12.0420, lng: -77.0955, programa: 'Comedor', familias: 30, color: '#f472b6' },
      { lat: -12.0460, lng: -77.0950, programa: 'Vaso de Leche', familias: 20, color: '#a78bfa' },
      { lat: -12.0435, lng: -77.0930, programa: 'CIAM', familias: 10, color: '#22d3ee' },
    ],
  },
  salud: {
    kpis: {
      campanas: { valor: 6, realizadas: 4, programadas: 2 },
      beneficiarios: { valor: '1,240', tipo: 'personas' },
      cumplimiento: { valor: '82%', meta: '1,500' },
    },
    campanas: [
      { titulo: 'Vacunación de Mascotas', fecha: '5 abr 2026 · Losa S3', estado: 'Completada', estadoTipo: 'green', stats: [{ valor: 187, label: 'Mascotas' }, { valor: 142, label: 'Familias' }, { valor: 200, label: 'Meta' }], avance: 93 },
      { titulo: 'Despistaje Anemia Infantil', fecha: '3 abr 2026 · Centro de Salud', estado: 'Completada', estadoTipo: 'green', stats: [{ valor: 230, label: 'Niños' }, { valor: 34, label: 'Con anemia', color: 'red' }, { valor: 250, label: 'Meta' }], avance: 92 },
      { titulo: 'Campaña Oftalmológica', fecha: '12 abr 2026 · Polideportivo', estado: 'Programada', estadoTipo: 'blue', stats: [{ valor: 0, label: 'Atendidos', color: 'muted' }, { valor: 300, label: 'Meta' }], avance: 0 },
    ],
  },
  educacion: {
    kpis: {
      talleres: { valor: 8, label: 'activos' },
      inscritos: { valor: 420, tipo: 'niños y jóvenes' },
      eventos: { valor: 3, periodo: 'abril' },
    },
    talleres: [
      { nombre: 'Fútbol infantil', horario: 'L-M-V 4pm', lugar: 'Losa S3', inscritos: 85, edad: '6-12' },
      { nombre: 'Danza folklórica', horario: 'Ma-Ju 5pm', lugar: 'Casa Cultura', inscritos: 60, edad: '8-16' },
      { nombre: 'Música (guitarra)', horario: 'Sáb 10am', lugar: 'Casa Cultura', inscritos: 35, edad: '10-18' },
      { nombre: 'Manualidades', horario: 'Mié 3pm', lugar: 'CIAM S1', inscritos: 45, edad: 'Adulto mayor' },
    ],
  },
};

// ===== WHATSAPP =====
const whatsappTrending = [
  { tema: '🚨 Seguridad vial', count: 14 },
  { tema: '🗑️ Basura acumulada', count: 12 },
  { tema: '🔊 Ruido excesivo', count: 8 },
  { tema: '🚗 Estacionamiento', count: 6 },
  { tema: '💡 Alumbrado', count: 5 },
  { tema: '🐕 Animales callejeros', count: 4 },
];

const whatsappGrupos = {
  serenazgo: { nombre: 'Serenazgo', icon: '🛡️', miembros: 12, mensajes: 18, color: 'blue' },
  fiscalizacion: { nombre: 'Fiscalización', icon: '📋', miembros: 8, mensajes: 7, color: 'amber' },
  ambulancia: { nombre: 'Ambulancia', icon: '🚑', miembros: 6, mensajes: 4, color: 'red' },
  rescate: { nombre: 'Rescate', icon: '🔥', miembros: 10, mensajes: 2, color: 'orange' },
  limpieza: { nombre: 'Limpieza', icon: '🧹', miembros: 9, mensajes: 11, color: 'green' },
};

const whatsappFeeds = {
  serenazgo: [],
  fiscalizacion: [],
  ambulancia: [],
  rescate: [],
  limpieza: [],
  municipal: [],
  ambiental: [],
  rentas: [],
  urbano: [],
  riesgo: [],
  humano: []
};

const mapaLayers = {
  incidencias: { color: '#f87171', label: 'Incidencias', points: [] },
  negocios: { color: '#fbbf24', label: 'Negocios', points: [] },
  obras: { color: '#fb923c', label: 'Obras', points: [] },
  riesgo: { color: '#f87171', label: 'Riesgo', points: [] },
  semaforo: { color: '#34d399', label: 'Semáforo', points: [] },
};

const whatsappReportes = [];

module.exports = {
  overviewKPIs, semaforo, alertas, gerencias, notificaciones,
  seguridadSerenazgo, seguridadFiscalizacion,
  ambiental,
  rentasRecaudacion, rentasFiscTributaria, rentasDesarrolloEco,
  urbano,
  riesgo,
  humano,
  whatsappTrending, whatsappGrupos, whatsappFeeds,
  whatsappReportes,
  mapaLayers,
};


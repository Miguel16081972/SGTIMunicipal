// ===== SGTI Municipal — PDF Generator (Versión Mejorada con Análisis Dinámico) =====
import { logActivity } from './activity.js';
import api from './api.js';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Mapeo de Sectores Técnicos a Nombres Reales/Hitos
// Mapeo de Sectores Técnicos a Nombres Reales/Hitos (Actualizado a 17 Sectores)
const SECTOR_NAMES = {
  'Sector 1': 'Cercado / Plaza Grau',
  'Sector 2': 'Villa Señor de los Milagros',
  'Sector 3': 'Parque Luna y Pozo',
  'Sector 4': 'Av. Morales Duárez / Manco Cápac',
  'Sector 5': 'Zona Industrial Cercado',
  'Sector 6': 'Límite Gambetta / Rímac',
  'Sector 7': 'Urb. Reynoso Central',
  'Sector 8': 'Av. Argentina / Sector Industrial',
  'Sector 9': 'Urb. San Rafael',
  'Sector 10': 'Sector 2 de Reynoso',
  'Sector 11': 'Límite con Callao / Gambetta',
  'Sector 12': 'Zona Comercial Argentina',
  'Sector 13': 'Urb. Juan Ingunza',
  'Sector 14': 'Sector 3 de Reynoso',
  'Sector 15': 'Urb. 1ro de Mayo',
  'Sector 16': 'Prolongación Av. Perú',
  'Sector 17': 'Límite con Lima / Av. Universitaria',
  'all': 'Distrito Completo'
};

const zoneDescriptions = {
  'Cercado / Plaza Grau': 'Zona histórica y administrativa; alta afluencia peatonal. Requiere énfasis en limpieza y ordenamiento ambulatorio.',
  'Villa Señor de los Milagros': 'Sector residencial consolidado; vigilancia preventiva contra ruidos molestos y mantenimiento de parques.',
  'Parque Luna y Pozo': 'Área recreativa familiar; prioritario el alumbrado público y patrullaje nocturno en zonas de juegos.',
  'Av. Morales Duárez / Manco Cápac': 'Corredor vial crítico; propenso a acumulación de basura en bermas y puntos de arrojo clandestino.',
  'Zona Industrial Cercado': 'Alta densidad de carga pesada; vigilancia de ITSE en almacenes y control de estacionamiento restringido.',
  'Límite Gambetta / Rímac': 'Punto de acceso distrital; requiere control preventivo en fronteras y vigilancia de la ribera del río.',
  'Urb. Reynoso Central': 'Corazón residencial de Reynoso; atención a solicitudes de poda y mantenimiento de veredas.',
  'Av. Argentina / Sector Industrial': 'Eje económico; fiscalización de licencias de funcionamiento e inspecciones de seguridad industrial.',
  'Urb. San Rafael': 'Zona de expansión residencial; monitoreo de seguridad ciudadana mediante cámaras vecinales.',
  'Sector 2 de Reynoso': 'Área de alta densidad poblacional; campañas de salud y saneamiento ambiental requeridas.',
  'Límite con Callao / Gambetta': 'Zona de transición interdistrital; operativos conjuntos de serenazgo para control de fronteras.',
  'Zona Comercial Argentina': 'Foco de recaudación; facilitar trámites tributarios y control de letreros publicitarios.',
  'Urb. Juan Ingunza': 'Sector con áreas verdes de mantenimiento frecuente; vigilancia contra micro-comercialización.',
  'Sector 3 de Reynoso': 'Zona con brecha de infraestructura vial; priorizar bacheo y señalización horizontal.',
  'Urb. 1ro de Mayo': 'Área de vulnerabilidad social; despliegue prioritario de programas alimentarios y DEMUNA.',
  'Prolongación Av. Perú': 'Conexión vial importante; control de paraderos informales y flujo vehicular.',
  'Límite con Lima / Av. Universitaria': 'Punto de alta congestión; requiere presencia de inspectores de transporte y orden vial.'
};

// Mapeo de Categorías a Ejes de Intervención y Descripciones Gerenciales
const EJE_CONFIG = {
  'Seguridad Vial': { eje: 'Seguridad y Patrullaje', desc: 'Vigilancia en puntos fijos y sectores críticos para prevención de accidentes y auxilio vial.' },
  'Comercio Informal': { eje: 'Control y Orden Público', desc: 'Control de comercio ambulatorio, fiscalización de espacios y apoyo a Serenazgo para el orden ciudadano.' },
  'Apoyo Social': { eje: 'Auxilio y Gestión Humana', desc: 'Atención a vecinos vulnerables, traslados de emergencia y apoyo social directo en campo.' },
  'Pelea Callejera': { eje: 'Orden y Convivencia', desc: 'Intervención en grescas, consumo de sustancias y ruidos molestos para mantener la paz social.' },
  'Persona Sospechosa': { eje: 'Prevención del Delito', desc: 'Detección de sujetos merodeando y apoyo operativo en capturas junto a la fuerza policial.' },
  'Basura Acumulada': { eje: 'Gestión Ambiental', desc: 'Identificación de focos infecciosos y coordinación para la erradicación de puntos críticos de basura.' },
  'Animal Callejero': { eje: 'Sanidad y Zoonosis', desc: 'Atención de reportes de animales en abandono o riesgo sanitario para la comunidad.' },
  'Pista/Vereda Dañada': { eje: 'Infraestructura Urbana', desc: 'Reporte de daños en vía pública para programación de mantenimiento y obras civiles.' },
  'Alumbrado Público': { eje: 'Servicios Públicos', desc: 'Monitoreo de iluminación pública y reporte de luminarias inoperativas en el distrito.' },
  // ── EJE DE RENTAS (SIMPLIFICADO) ──
  'Gestión de Rentas': { eje: 'Gestión Tributaria y Económica', desc: 'Control de arbitrios, impuesto predial, fiscalización de licencias de funcionamiento y ITSE.' },
  // ── EJE DE DESARROLLO HUMANO ──
  'Bienestar Animal (Patitas)': { eje: 'Bienestar Animal y Social', desc: 'Campañas de desparasitación, eventos Jueves de Patitas y salud canina para beneficio de la población.' },
  // ── EJE DE PARTICIPACIÓN VECINAL ──
  'OPC (Participación)': { eje: 'Participación Ciudadana', desc: 'Gestión de organizaciones sociales, juntas vecinales y coordinación con la comunidad.' },
  'DEMUNA': { eje: 'Protección al Menor', desc: 'Defensoría del niño y adolescente, atención de casos de vulnerabilidad y protección infantil.' },
  'CIAM (Adulto Mayor)': { eje: 'Atención al Adulto Mayor', desc: 'Programas de integración, salud y bienestar para la población de la tercera edad.' },
  'OMAPED (Discapacidad)': { eje: 'Inclusión y Discapacidad', desc: 'Gestión de beneficios, carnets CONADIS y apoyo a personas con habilidades diferentes.' },
  'Vaso de Leche / Comedor': { eje: 'Seguridad Alimentaria', desc: 'Distribución de alimentos y gestión de comedores populares para población vulnerable.' },
  // ── NUEVAS CATEGORIAS PARA CAPTURAR MÁS DATOS ──
  'Robo / Asalto': { eje: 'Seguridad y Patrullaje', desc: 'Atención y respuesta ante hechos delictivos de robo y asalto en la vía pública.' },
  'Ruido Excesivo': { eje: 'Orden y Convivencia', desc: 'Fiscalización de contaminación sonora y control de establecimientos con exceso de ruido.' },
  'Sin clasificar': { eje: 'Gestión Municipal General', desc: 'Reportes ciudadanos pendientes de clasificación temática por el sistema de gestión territorial.' },
};

const DEFAULT_EJE = { eje: 'Gestión Municipal Atendida', desc: 'Intervención protocolar para la resolución de reportes y quejas ciudadanas registradas.' };

const REPORT_TEXT_CONFIG = {
  general: {
    title: 'Informe Estratégico de Gestión Territorial',
    intro: 'El presente documento consolida la operatividad de las unidades orgánicas en los 17 sectores de Carmen de la Legua Reynoso. El análisis se basa en el despliegue territorial inteligente para garantizar la gobernanza y eficiencia municipal.',
    recommendations: [
      '• Optimizar la distribución de recursos operativos priorizando los sectores con mayor criticidad detectada.',
      '• Fortalecer el patrullaje sin fronteras en los sectores límite (6, 11 y 17) para reducir la incidencia delictiva externa.',
      '• Implementar un cronograma de mantenimiento de parques rotativo que cubra los 17 sectores en ciclos de 30 días.',
      '• Digitalizar el catastro en los sectores industriales (5 y 8) para elevar la recaudación tributaria en un 15%.'
    ]
  },
  seguridad: {
    title: 'Informe Operativo de Seguridad Ciudadana',
    intro: 'Análisis de patrullaje y prevención delictiva con enfoque sectorizado. Se detalla el cumplimiento de metas de vigilancia y control de la vía pública en los puntos calientes del distrito.',
    recommendations: [
      '• Desplegar brigadas motorizadas de respuesta rápida en los sectores con mayor incidencia durante los cambios de turno comercial.',
      '• Instalar botones de pánico inteligentes en los parques principales de los sectores con mayor número de reportes.',
      '• Realizar operativos de control de identidad focalizados en los sectores fronterizos para disuadir ingresos no autorizados.',
      '• Capacitar a los vigilantes de cuadra en el uso del aplicativo SGTI para reportes inmediatos.'
    ]
  },
  ambiental: {
    title: 'Informe de Gestión Ambiental y Salubridad',
    intro: 'Estado situacional de la limpieza pública y ornato. Se monitorea la erradicación de puntos críticos de basura y la salud ambiental en los 17 sectores territoriales.',
    recommendations: [
      '• Implementar "ECO-Rutas" de reciclaje diferenciado iniciando por los sectores residenciales con mayor densidad.',
      '• Recuperar los espacios públicos degradados mediante arborización y mobiliario urbano.',
      '• Sancionar mediante cámaras térmicas el arrojo de desmonte nocturno en los puntos críticos detectados.',
      '• Intensificar el barrido de calles en los sectores comerciales tras el cierre de jornada.'
    ]
  },
  rentas: {
    title: 'Informe de Gestión Tributaria y Económica',
    intro: 'Indicadores de recaudación y fiscalización económica. Se analiza la salud financiera y la formalización comercial bajo el marco de la inteligencia territorial.',
    recommendations: [
      '• Realizar campañas itinerantes de "Rentas en tu Sector" visitando semanalmente los 17 sectores del distrito.',
      '• Fiscalizar el uso de vía pública por sobre-stock en las empresas del Sector Industrial.',
      '• Automatizar las licencias de funcionamiento de bajo riesgo para los emprendedores locales.',
      '• Iniciar procesos de cobranza coactiva solo tras agotar la etapa de sensibilización personalizada en campo.'
    ]
  },
  urbano: {
    title: 'Informe de Desarrollo Urbano y Ornato',
    intro: 'Seguimiento de obras públicas y mantenimiento de la infraestructura urbana. La prioridad es la conectividad y el estado óptimo del catastro municipal.',
    recommendations: [
      '• Ejecutar el plan maestro de bacheo iniciando por las vías colectoras con mayor tráfico.',
      '• Modernizar el mobiliario urbano de los sectores históricos manteniendo su valor patrimonial.',
      '• Revisar las autorizaciones de construcción para asegurar el cumplimiento del retiro municipal.',
      '• Implementar un sistema de riego tecnificado en los parques del corredor central.'
    ]
  },
  humano: {
    title: 'Informe de Bienestar y Desarrollo Humano',
    intro: 'Impacto de los programas sociales y servicios de salud. El enfoque territorial asegura que la ayuda llegue a las zonas con mayores indicadores de vulnerabilidad.',
    recommendations: [
      '• Ampliar la cobertura de "Vaso de Leche" en los asentamientos vulnerables.',
      '• Implementar tele-salud para adultos mayores del CIAM que residen en los sectores alejados de la central.',
      '• Fomentar la creación de bio-huertos escolares en las instituciones educativas del distrito.',
      '• Organizar ferias de servicios integrales (Salud, DEMUNA, OMAPED) de forma rotativa en los 17 sectores.'
    ]
  },
  participacion: {
    title: 'Informe Detallado de Participación Vecinal',
    intro: 'La Subgerencia de Participación Vecinal reporta el estado situacional de sus 4 ejes principales: OPC, DEMUNA, CIAM y OMAPED.',
    recommendations: [
      '• Ejecutar jornadas de sensibilización "Casa por Casa" sobre violencia familiar en coordinación con DEMUNA.',
      '• Automatizar el registro de asistencia y monitoreo de salud para los miembros del CIAM mediante códigos QR.',
      '• Establecer convenios con empresas del sector industrial para la inserción laboral de personas registradas en OMAPED.',
      '• Renovar la directiva de las Juntas Vecinales en los sectores donde la participación ciudadana ha disminuido según el feed.'
    ]
  }
};

const DEFAULT_CONFIG = {
  title: 'Informe de Gestión Municipal',
  intro: 'Intervención protocolar para la resolución de reportes y quejas ciudadanas registradas en el periodo correspondiente.',
  recommendations: [
    '• Mantener el tiempo de respuesta promedio detectado.',
    '• Fortalecer la comunicación con el vecino mediante canales digitales.',
    '• Continuar el monitoreo de incidencias críticas en los 17 sectores.',
    '• Realizar un seguimiento post-atención para validar la satisfacción del vecino.'
  ]
};

const GROUP_AXIS_WHITELIST = {
  seguridad: ['Seguridad y Patrullaje', 'Control y Orden Público', 'Prevención del Delito', 'Orden y Convivencia'],
  ambiental: ['Gestión Ambiental', 'Sanidad y Zoonosis'],
  rentas: ['Gestión Tributaria y Económica'],
  urbano: ['Infraestructura Urbana', 'Servicios Públicos', 'Ornato y Mantenimiento'],
  humano: ['Auxilio y Gestión Humana', 'Bienestar Animal y Social', 'Participación Ciudadana', 'Protección al Menor', 'Atención al Adulto Mayor', 'Inclusión y Discapacidad', 'Seguridad Alimentaria'],
  participacion: ['Participación Vecinal', 'Protección al Menor', 'Atención al Adulto Mayor', 'Inclusión y Discapacidad', 'Seguridad Alimentaria'],
  opc: ['Participación Ciudadana'],
  demuna: ['Protección al Menor'],
  ciam: ['Atención al Adulto Mayor'],
  omaped: ['Inclusión y Discapacidad'],
  general: null // Permite todos los ejes
};

// ===== HELPERS PARA ANÁLISIS DINÁMICO =====

function calcularDiasPeriodo(from, to) {
  const d1 = new Date(from);
  const d2 = new Date(to);
  return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
}

function calcularPromediosDiarios(reportes, dias) {
  return (reportes.length / dias).toFixed(1);
}

function obtenerDistribucionPorEstado(reportes) {
  const estados = { nuevo: 0, en_proceso: 0, atendido: 0 };
  reportes.forEach(r => {
    if (estados[r.estado] !== undefined) estados[r.estado]++;
    else estados.nuevo++;
  });
  return estados;
}

function obtenerDistribucionPorPrioridad(reportes) {
  const prioridades = { Alta: 0, Media: 0, Baja: 0 };
  reportes.forEach(r => {
    if (prioridades[r.prioridad] !== undefined) prioridades[r.prioridad]++;
    else prioridades.Media++;
  });
  return prioridades;
}

function obtenerDistribucionPorCategoria(reportes) {
  const categorias = {};
  reportes.forEach(r => {
    const cat = r.categoria || 'Sin clasificar';
    categorias[cat] = (categorias[cat] || 0) + 1;
  });
  return Object.entries(categorias).sort((a, b) => b[1] - a[1]);
}

function obtenerVolumenDiario(reportes) {
  const porDia = {};
  reportes.forEach(r => {
    const dia = new Date(r.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    porDia[dia] = (porDia[dia] || 0) + 1;
  });
  return Object.entries(porDia).sort((a, b) => b[1] - a[1]);
}

function obtenerHorasPico(reportes) {
  const porHora = {};
  reportes.forEach(r => {
    const hora = new Date(r.fecha).getHours();
    const rango = `${String(hora).padStart(2, '0')}:00 - ${String(hora).padStart(2, '0')}:59`;
    porHora[rango] = (porHora[rango] || 0) + 1;
  });
  return Object.entries(porHora).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function generarIntroduccionDinamica(config, reportes, dias, grupo) {
  const total = reportes.length;
  const promedio = calcularPromediosDiarios(reportes, dias);
  const estados = obtenerDistribucionPorEstado(reportes);
  const prioridades = obtenerDistribucionPorPrioridad(reportes);
  const tasaAtencion = total > 0 ? ((estados.atendido / total) * 100).toFixed(1) : '0';
  
  let intro = config.intro;
  intro += ` Durante el periodo analizado de ${dias} días, se registraron un total de ${total.toLocaleString('es-PE')} incidencias, con un promedio de ${promedio} reportes diarios.`;
  intro += ` Del total, ${estados.atendido.toLocaleString('es-PE')} fueron atendidos (${tasaAtencion}% de tasa de resolución), ${estados.en_proceso.toLocaleString('es-PE')} se encuentran en proceso y ${estados.nuevo.toLocaleString('es-PE')} están pendientes de gestión.`;
  
  if (prioridades.Alta > 0) {
    const pctAlta = ((prioridades.Alta / total) * 100).toFixed(1);
    intro += ` Se identificaron ${prioridades.Alta.toLocaleString('es-PE')} incidencias de prioridad Alta (${pctAlta}%), requiriendo atención inmediata.`;
  }
  
  return intro;
}

function generarRecomendacionesDinamicas(config, reportes, sectorStats, ejeSummary) {
  const recomendaciones = [];
  
  // Recomendación basada en el sector con más incidencias
  const topSectores = Object.entries(sectorStats).sort((a, b) => b[1] - a[1]);
  if (topSectores.length > 0) {
    recomendaciones.push(`• Priorizar la intervención en ${topSectores[0][0]} que concentra ${topSectores[0][1].toLocaleString('es-PE')} incidencias (${((topSectores[0][1] / reportes.length) * 100).toFixed(1)}% del total), siendo el sector más demandante del periodo.`);
  }
  
  // Recomendación basada en prioridades altas
  const prioridades = obtenerDistribucionPorPrioridad(reportes);
  if (prioridades.Alta > 0) {
    recomendaciones.push(`• Atender con urgencia las ${prioridades.Alta.toLocaleString('es-PE')} incidencias clasificadas como Alta prioridad, desplegando equipos de respuesta rápida en las zonas más afectadas.`);
  }
  
  // Recomendación basada en tasa de resolución
  const estados = obtenerDistribucionPorEstado(reportes);
  const tasaResolucion = reportes.length > 0 ? (estados.atendido / reportes.length) * 100 : 0;
  if (tasaResolucion < 50) {
    recomendaciones.push(`• Incrementar la capacidad operativa para mejorar la tasa de resolución actual del ${tasaResolucion.toFixed(1)}%. Se recomienda un mínimo del 70% de atención en el próximo periodo.`);
  } else {
    recomendaciones.push(`• Mantener y optimizar la tasa de resolución actual del ${tasaResolucion.toFixed(1)}%, implementando métricas de calidad de servicio además de cantidad.`);
  }

  // Recomendación sobre reportes pendientes
  if (estados.nuevo > 0) {
    recomendaciones.push(`• Gestionar los ${estados.nuevo.toLocaleString('es-PE')} reportes pendientes (estado "nuevo") con un plan de atención escalonado para reducir el tiempo de respuesta ciudadano.`);
  }
  
  // Agregar recomendaciones fijas del grupo
  config.recommendations.forEach(r => recomendaciones.push(r));
  
  return recomendaciones;
}

// ===== HELPER DE PAGINACIÓN =====
function checkPageBreak(doc, y, requiredSpace = 30) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

export async function generateReportesPdf(grupo) {
  logActivity('Generando Informe Territorial Premium: ' + grupo);
  
  try {
    const config = REPORT_TEXT_CONFIG[grupo] || DEFAULT_CONFIG;
    
    // Capturar filtros de fecha actuales del Dashboard
    let from = document.getElementById('filter-from')?.value;
    let to = document.getElementById('filter-to')?.value;

    // Lógica Semanal por Defecto: Si no hay fechas, calculamos la semana actual (Lunes a Domingo)
    let isWeeklyDefault = false;
    if (!from || !to) {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      from = lastWeek.toISOString().split('T')[0];
      to = today.toISOString().split('T')[0];
      isWeeklyDefault = true;
    }

    const filters = grupo === 'general' ? {} : { grupo };
    if (from) filters.from = from;
    if (to) filters.to = to;
    filters.limit = 'all'; // Extraer toda la data para el PDF

    const { stats, reportes } = await api.getWhatsappReportes(filters);
    
    // Usar TODOS los reportes del periodo para el análisis completo
    // (No filtramos por whitelist para el análisis, solo para la tabla de ejes específicos)
    const whitelist = GROUP_AXIS_WHITELIST[grupo];
    const filteredReportes = whitelist 
      ? reportes.filter(r => whitelist.includes((EJE_CONFIG[r.categoria] || DEFAULT_EJE).eje))
      : reportes;

    // Calcular métricas dinámicas
    const diasPeriodo = calcularDiasPeriodo(from, to);
    const promedioDiario = calcularPromediosDiarios(reportes, diasPeriodo);
    const estados = obtenerDistribucionPorEstado(reportes);
    const prioridades = obtenerDistribucionPorPrioridad(reportes);
    const categorias = obtenerDistribucionPorCategoria(reportes);
    const horasPico = obtenerHorasPico(reportes);
    const volumenDiario = obtenerVolumenDiario(reportes);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.getWidth();
    
    // ===== CAPA 1: PORTADA / CABECERA EJECUTIVA =====
    doc.setFillColor(8, 13, 26); doc.rect(0, 0, w, 52, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(18); doc.setFont(undefined, 'bold');
    
    // Título específico
    doc.text(config.title.toUpperCase(), 14, 16);
    doc.setFontSize(13);
    doc.setTextColor(79, 143, 247); // Color azul SGTI
    doc.text(isWeeklyDefault ? 'REPORTE SEMANAL DE GESTIÓN TERRITORIAL' : 'REPORTE ESTRATÉGICO DE GESTIÓN', 14, 24);
    
    doc.setDrawColor(79, 143, 247); doc.setLineWidth(0.8); doc.line(14, 28, 60, 28);
    
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`Destinatario: Alcalde de Carmen de la Legua Reynoso`, 14, 34);
    doc.text(`Unidad: Gerencia de ${grupo === 'general' ? 'Gestión Territorial' : grupo.charAt(0).toUpperCase() + grupo.slice(1)}`, 110, 34);
    
    const formatDate = (dateStr) => {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    const dateRangeText = `Periodo: del ${formatDate(from)} al ${formatDate(to)} (${diasPeriodo} días)`;
      
    doc.setFont(undefined, 'bold');
    doc.text(dateRangeText, 14, 40);
    doc.setFont(undefined, 'normal');
    doc.text(`Muestra: ${reportes.length.toLocaleString('es-PE')} incidencias analizadas`, 110, 40);

    // KPIs en la cabecera
    doc.setFontSize(8);
    doc.text(`Promedio diario: ${promedioDiario} reportes | Alta prioridad: ${prioridades.Alta} | Tasa resolución: ${reportes.length > 0 ? ((estados.atendido / reportes.length) * 100).toFixed(1) : 0}%`, 14, 47);

    doc.setTextColor(40, 40, 40);
    let y = 62;

    // ===== SECCIÓN 1: RESUMEN DE OPERATIVIDAD (DINÁMICO) =====
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('1. Resumen de Operatividad y Despliegue', 14, y); y += 8;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    
    // Introducción DINÁMICA que incorpora los datos reales
    const introText = generarIntroduccionDinamica(config, reportes, diasPeriodo, grupo);
    const splitIntro = doc.splitTextToSize(introText, w - 28);
    doc.text(splitIntro, 14, y);
    y += (splitIntro.length * 5) + 6;

    // ===== SECCIÓN 1.1: CUADRO DE INDICADORES CLAVE =====
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.text('1.1 Indicadores Clave del Periodo', 14, y); y += 6;

    const kpiData = [
      ['Indicador', 'Valor', 'Observación'],
      ['Total de Incidencias', reportes.length.toLocaleString('es-PE'), `En ${diasPeriodo} días de operación`],
      ['Promedio Diario', promedioDiario, `Volumen de reportes por día`],
      ['Incidencias Atendidas', estados.atendido.toLocaleString('es-PE'), `${reportes.length > 0 ? ((estados.atendido / reportes.length) * 100).toFixed(1) : 0}% tasa de resolución`],
      ['Incidencias En Proceso', estados.en_proceso.toLocaleString('es-PE'), `${reportes.length > 0 ? ((estados.en_proceso / reportes.length) * 100).toFixed(1) : 0}% del total`],
      ['Incidencias Pendientes', estados.nuevo.toLocaleString('es-PE'), `${reportes.length > 0 ? ((estados.nuevo / reportes.length) * 100).toFixed(1) : 0}% requieren atención`],
      ['Prioridad Alta', prioridades.Alta.toLocaleString('es-PE'), `${reportes.length > 0 ? ((prioridades.Alta / reportes.length) * 100).toFixed(1) : 0}% del total`],
      ['Prioridad Media', prioridades.Media.toLocaleString('es-PE'), `${reportes.length > 0 ? ((prioridades.Media / reportes.length) * 100).toFixed(1) : 0}% del total`],
      ['Prioridad Baja', prioridades.Baja.toLocaleString('es-PE'), `${reportes.length > 0 ? ((prioridades.Baja / reportes.length) * 100).toFixed(1) : 0}% del total`],
    ];

    doc.autoTable({
      startY: y,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
      headStyles: { fillColor: [8, 13, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 35, halign: 'center', fontStyle: 'bold', textColor: [79, 143, 247] },
        2: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 10;

    // ===== SECCIÓN 2: ANÁLISIS DE INTERVENCIONES POR EJES =====
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('2. Análisis de Intervenciones por Ejes de Gestión', 14, y); y += 6;
    
    // Agregación por Eje — Usar TODOS los reportes (no filtrados) para dar contexto completo
    const ejeSummary = {};
    reportes.forEach(r => {
      const eConfig = EJE_CONFIG[r.categoria] || DEFAULT_EJE;
      if (!ejeSummary[eConfig.eje]) {
        ejeSummary[eConfig.eje] = { count: 0, desc: eConfig.desc };
      }
      ejeSummary[eConfig.eje].count++;
    });

    const tableBody = Object.entries(ejeSummary)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([eje, data]) => [
        eje,
        data.count.toLocaleString('es-PE'),
        `${reportes.length > 0 ? ((data.count / reportes.length) * 100).toFixed(1) : 0}%`,
        data.desc
      ]);

    if (tableBody.length > 0) {
      doc.autoTable({
        startY: y,
        head: [['Eje de Intervención', 'Cantidad', '% del Total', 'Descripción de Actividades']],
        body: tableBody,
        styles: { fontSize: 7.5, cellPadding: 3.5, valign: 'middle' },
        headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: 'bold' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      doc.text('No se registraron intervenciones clasificadas por eje en este periodo.', 14, y);
      y += 8;
    }

    // ===== SECCIÓN 2.1: DESGLOSE POR CATEGORÍA ESPECÍFICA =====
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.text('2.1 Desglose por Categoría de Incidencia', 14, y); y += 6;

    if (categorias.length > 0) {
      const catTableBody = categorias.map(([cat, count]) => [
        cat,
        count.toLocaleString('es-PE'),
        `${((count / reportes.length) * 100).toFixed(1)}%`,
        (EJE_CONFIG[cat] || DEFAULT_EJE).eje
      ]);

      doc.autoTable({
        startY: y,
        head: [['Categoría', 'Cantidad', '% del Total', 'Eje Asignado']],
        body: catTableBody,
        styles: { fontSize: 7.5, cellPadding: 3, valign: 'middle' },
        headStyles: { fillColor: [79, 143, 247], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ===== SECCIÓN 3: DISTRIBUCIÓN TERRITORIAL (17 SECTORES) =====
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('3. Análisis de Incidencia por Sectores Oficiales', 14, y); y += 8;
    
    // Agregación por Sector con nombres reales
    const sectorStats = {};
    reportes.forEach(r => {
      const sectorKey = r.sector || 'Sin sector';
      const realName = SECTOR_NAMES[sectorKey] || sectorKey || 'Sin sector';
      sectorStats[realName] = (sectorStats[realName] || 0) + 1;
    });

    // Tabla completa de sectores
    const sectorTableBody = Object.entries(sectorStats)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => [
        `${idx + 1}`,
        name,
        count.toLocaleString('es-PE'),
        `${((count / reportes.length) * 100).toFixed(1)}%`,
        zoneDescriptions[name] || 'Sector bajo monitoreo territorial.'
      ]);

    if (sectorTableBody.length > 0) {
      doc.autoTable({
        startY: y,
        head: [['#', 'Sector / Zona', 'Incidencias', '% Total', 'Caracterización']],
        body: sectorTableBody,
        styles: { fontSize: 7, cellPadding: 3, valign: 'middle', overflow: 'linebreak' },
        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 42, fontStyle: 'bold' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 'auto', fontStyle: 'italic', fontSize: 6.5 }
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // Análisis escrito de los Top 3 sectores
    y = checkPageBreak(doc, y, 30);
    const topZones = Object.entries(sectorStats).sort((a,b) => b[1]-a[1]).slice(0, 3);
    
    if (topZones.length > 0) {
      doc.setFontSize(10); doc.setFont(undefined, 'bold');
      doc.text('Sectores Críticos (Mayor concentración):', 14, y); y += 6;
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      
      topZones.forEach(([name, count], idx) => {
        y = checkPageBreak(doc, y, 14);
        const pct = ((count / reportes.length) * 100).toFixed(1);
        doc.setFont(undefined, 'bold'); doc.text(`${idx + 1}. ${name}:`, 14, y);
        doc.setFont(undefined, 'normal');
        const zoneAnalysis = `${count.toLocaleString('es-PE')} incidencias (${pct}% del total). ${zoneDescriptions[name] || 'Zona que requiere monitoreo preventivo según la tendencia detectada.'}`;
        const splitAnalysis = doc.splitTextToSize(zoneAnalysis, w - 28);
        doc.text(splitAnalysis, 14, y + 4.5);
        y += (splitAnalysis.length * 4.5) + 6;
      });
    }

    // ===== SECCIÓN 4: ANÁLISIS TEMPORAL =====
    y = checkPageBreak(doc, y, 50);
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('4. Análisis Temporal y Patrones de Reporte', 14, y); y += 8;

    // 4.1 Horarios pico
    if (horasPico.length > 0) {
      doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.text('4.1 Horarios de Mayor Actividad', 14, y); y += 6;

      doc.autoTable({
        startY: y,
        head: [['Rango Horario', 'Cantidad de Reportes', '% del Total']],
        body: horasPico.map(([hora, count]) => [
          hora,
          count.toLocaleString('es-PE'),
          `${((count / reportes.length) * 100).toFixed(1)}%`
        ]),
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
        headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 'auto', halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // 4.2 Días con mayor volumen
    if (volumenDiario.length > 0) {
      y = checkPageBreak(doc, y, 40);
      doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.text('4.2 Días con Mayor Volumen de Reportes', 14, y); y += 6;

      const topDias = volumenDiario.slice(0, 10);
      doc.autoTable({
        startY: y,
        head: [['Día', 'Cantidad', '% del Total']],
        body: topDias.map(([dia, count]) => [
          dia,
          count.toLocaleString('es-PE'),
          `${((count / reportes.length) * 100).toFixed(1)}%`
        ]),
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
        headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 'auto', halign: 'center' }
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ===== SECCIÓN 5: ESTADO DE GESTIÓN =====
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('5. Estado de Gestión de Incidencias', 14, y); y += 8;

    doc.autoTable({
      startY: y,
      head: [['Estado', 'Cantidad', 'Porcentaje', 'Interpretación']],
      body: [
        ['Nuevo (Pendiente)', estados.nuevo.toLocaleString('es-PE'), `${reportes.length > 0 ? ((estados.nuevo / reportes.length) * 100).toFixed(1) : 0}%`, 'Reportes recibidos que aún no han sido asignados ni atendidos.'],
        ['En Proceso', estados.en_proceso.toLocaleString('es-PE'), `${reportes.length > 0 ? ((estados.en_proceso / reportes.length) * 100).toFixed(1) : 0}%`, 'Incidencias asignadas a equipos de campo en proceso de resolución.'],
        ['Atendido', estados.atendido.toLocaleString('es-PE'), `${reportes.length > 0 ? ((estados.atendido / reportes.length) * 100).toFixed(1) : 0}%`, 'Casos resueltos satisfactoriamente durante el periodo.'],
      ],
      styles: { fontSize: 8, cellPadding: 3.5, valign: 'middle' },
      headStyles: { fillColor: [8, 13, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 22, halign: 'center', textColor: [79, 143, 247], fontStyle: 'bold' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 10;

    // ===== SECCIÓN 6: CONCLUSIONES Y RECOMENDACIONES (DINÁMICAS) =====
    y = checkPageBreak(doc, y, 50);
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('6. Conclusiones y Recomendaciones', 14, y); y += 8;
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    
    // Recomendaciones DINÁMICAS basadas en los datos
    const recomendaciones = generarRecomendacionesDinamicas(config, reportes, sectorStats, ejeSummary);
    
    recomendaciones.forEach(item => {
      y = checkPageBreak(doc, y, 12);
      const splitRec = doc.splitTextToSize(item, w - 28);
      doc.text(splitRec, 14, y);
      y += (splitRec.length * 4.5) + 3;
    });

    // ===== FIRMA / CIERRE =====
    y = checkPageBreak(doc, y, 30);
    y += 10;
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3); doc.line(14, y, w - 14, y); y += 8;
    doc.setFontSize(8); doc.setTextColor(120, 120, 120);
    doc.text('Documento generado automáticamente por el Sistema de Gestión Territorial Inteligente (SGTI v5 Premium).', 14, y);
    y += 4;
    doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-PE')} | Periodo analizado: ${formatDate(from)} al ${formatDate(to)} | Total procesado: ${reportes.length.toLocaleString('es-PE')} registros.`, 14, y);

    // Footer en todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text('SGTI v5 Premium — Sistema de Gestión Territorial — Confidencial', 14, 285);
      doc.text(`Página ${i} de ${pageCount}`, 180, 285);
    }

    // Exportar PDF dependiendo de la plataforma
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        const base64Data = doc.output('datauristring').split(',')[1];
        const fileName = `Reporte_SGTI_${grupo}.pdf`;
        
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: `Reporte SGTI - ${grupo}`,
          url: savedFile.uri,
          dialogTitle: 'Compartir Informe PDF'
        });
      } catch (err) {
        console.error('Error nativo compartiendo PDF:', err);
        alert('Hubo un error al guardar o compartir el PDF en tu celular.');
      }
    } else {
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    }

    logActivity('Reporte Ejecutivo Generado con éxito: ' + grupo);
  } catch (e) {
    alert('Error al generar el Informe Ejecutivo. Por favor reintente.');
    console.error(e);
  }
}

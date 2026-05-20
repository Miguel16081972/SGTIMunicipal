// ===== SGTI Municipal — PDF Generator =====
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
};

const DEFAULT_EJE = { eje: 'Gestión Municipal Atendida', desc: 'Intervención protocolar para la resolución de reportes y quejas ciudadanas registradas.' };

const REPORT_TEXT_CONFIG = {
  general: {
    title: 'Informe Estratégico de Gestión Territorial',
    intro: 'El presente documento consolida la operatividad de las unidades orgánicas en los 17 sectores de Carmen de la Legua Reynoso. El análisis se basa en el despliegue territorial inteligente para garantizar la gobernanza y eficiencia municipal.',
    recommendations: [
      '• Optimizar la distribución de recursos operativos priorizando los sectores 3, 5 y 15 por su alta criticidad detectada.',
      '• Fortalecer el patrullaje sin fronteras en los sectores límite (6, 11 y 17) para reducir la incidencia delictiva externa.',
      '• Implementar un cronograma de mantenimiento de parques rotativo que cubra los 17 sectores en ciclos de 30 días.',
      '• Digitalizar el catastro en los sectores industriales (5 y 8) para elevar la recaudación tributaria en un 15%.'
    ]
  },
  seguridad: {
    title: 'Informe Operativo de Seguridad Ciudadana',
    intro: 'Análisis de patrullaje y prevención delictiva con enfoque sectorizado. Se detalla el cumplimiento de metas de vigilancia y control de la vía pública en los puntos calientes del distrito.',
    recommendations: [
      '• Desplegar brigadas motorizadas de respuesta rápida en el Sector 1 y 4 durante los cambios de turno comercial.',
      '• Instalar botones de pánico inteligentes en los parques principales de los sectores 2, 7 y 14.',
      '• Realizar operativos de control de identidad focalizados en el Sector 6 (Límite Gambetta) para disuadir ingresos no autorizados.',
      '• Capacitar a los vigilantes de cuadra en el uso del aplicativo SGTI para reportes inmediatos.'
    ]
  },
  ambiental: {
    title: 'Informe de Gestión Ambiental y Salubridad',
    intro: 'Estado situacional de la limpieza pública y ornato. Se monitorea la erradicación de puntos críticos de basura y la salud ambiental en los 17 sectores territoriales.',
    recommendations: [
      '• Implementar "ECO-Rutas" de reciclaje diferenciado iniciando por los sectores residenciales 9 y 13.',
      '• Recuperar los espacios públicos degradados en el Sector 15 mediante arborización y mobiliario urbano.',
      '• Sancionar mediante cámaras térmicas el arrojo de desmonte nocturno en el eje de la Av. Morales Duárez (Sector 4).',
      '• Intensificar el barrido de calles en los sectores comerciales 1 y 12 tras el cierre de jornada.'
    ]
  },
  rentas: {
    title: 'Informe de Gestión Tributaria y Económica',
    intro: 'Indicadores de recaudación y fiscalización económica. Se analiza la salud financiera y la formalización comercial bajo el marco de la inteligencia territorial.',
    recommendations: [
      '• Realizar campañas itinerantes de "Rentas en tu Sector" visitando semanalmente los 17 sectores del distrito.',
      '• Fiscalizar el uso de vía pública por sobre-stock en las empresas del Sector Industrial (8).',
      '• Automatizar las licencias de funcionamiento de bajo riesgo para los emprendedores de los sectores 10 y 14.',
      '• Iniciar procesos de cobranza coactiva solo tras agotar la etapa de sensibilización personalizada en campo.'
    ]
  },
  urbano: {
    title: 'Informe de Desarrollo Urbano y Ornato',
    intro: 'Seguimiento de obras públicas y mantenimiento de la infraestructura urbana. La prioridad es la conectividad y el estado óptimo del catastro municipal.',
    recommendations: [
      '• Ejecutar el plan maestro de bacheo iniciando por las vías colectoras de los sectores 16 y 17.',
      '• Modernizar el mobiliario urbano de la Plaza Grau (Sector 1) manteniendo su valor histórico.',
      '• Revisar las autorizaciones de construcción en el Sector 5 para asegurar el cumplimiento del retiro municipal.',
      '• Implementar un sistema de riego tecnificado en los parques del corredor central (Sectores 3 y 7).'
    ]
  },
  humano: {
    title: 'Informe de Bienestar y Desarrollo Humano',
    intro: 'Impacto de los programas sociales y servicios de salud. El enfoque territorial asegura que la ayuda llegue a las zonas con mayores indicadores de vulnerabilidad.',
    recommendations: [
      '• Ampliar la cobertura de "Vaso de Leche" en los asentamientos del Sector 15.',
      '• Implementar tele-salud para adultos mayores del CIAM que residen en los sectores alejados de la central.',
      '• Fomentar la creación de bio-huertos escolares en las instituciones de los sectores 2 y 9.',
      '• Organizar ferias de servicios integrales (Salud, DEMUNA, OMAPED) de forma rotativa en los 17 sectores.'
    ]
  },
  participacion: {
    title: 'Informe Detallado de Participación Vecinal',
    intro: 'La Subgerencia de Participación Vecinal reporta el estado situacional de sus 4 ejes principales: OPC, DEMUNA, CIAM y OMAPED.',
    recommendations: [
      '• Ejecutar jornadas de sensibilización "Casa por Casa" sobre violencia familiar en coordinación con DEMUNA en el Sector 4.',
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

    const { stats, reportes } = await api.getWhatsappReportes(filters);
    
    // Filtrar reportes por Ejes permitidos para esta área (Coherencia Temática)
    const whitelist = GROUP_AXIS_WHITELIST[grupo];
    const filteredReportes = whitelist 
      ? reportes.filter(r => whitelist.includes((EJE_CONFIG[r.categoria] || DEFAULT_EJE).eje))
      : reportes;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.getWidth();
    
    // ===== CAPA 1: PORTADA / CABECERA EJECUTIVA =====
    doc.setFillColor(8, 13, 26); doc.rect(0, 0, w, 48, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(18); doc.setFont(undefined, 'bold');
    
    // Título específico
    doc.text(config.title.toUpperCase(), 14, 18);
    doc.setFontSize(14);
    doc.setTextColor(79, 143, 247); // Color azul SGTI
    doc.text(isWeeklyDefault ? 'REPORTE SEMANAL DE GESTIÓN TERRITORIAL' : 'REPORTE ESTRATÉGICO DE GESTIÓN', 14, 26);
    
    doc.setDrawColor(79, 143, 247); doc.setLineWidth(0.8); doc.line(14, 30, 60, 30);
    
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont(undefined, 'normal');
    doc.text(`Destinatario: Alcalde de Carmen de la Legua Reynoso`, 14, 38);
    doc.text(`Unidad: Gerencia de ${grupo === 'general' ? 'Gestión Territorial' : grupo.charAt(0).toUpperCase() + grupo.slice(1)}`, 110, 38);
    
    const formatDate = (dateStr) => {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    const dateRangeText = `Periodo: del ${formatDate(from)} al ${formatDate(to)}`;
      
    doc.setFont(undefined, 'bold');
    doc.text(dateRangeText, 14, 43);
    doc.setFont(undefined, 'normal');
    doc.text(`Muestra: ${reportes.length} incidencias analizadas`, 110, 43);

    doc.setTextColor(40, 40, 40);
    let y = 60;

    // ===== SECCIÓN 1: RESUMEN DE OPERATIVIDAD =====
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('1. Resumen de Operatividad y Despliegue', 14, y); y += 8;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    
    // Introducción específica
    const splitIntro = doc.splitTextToSize(config.intro, w - 28);
    doc.text(splitIntro, 14, y);
    y += (splitIntro.length * 5) + 8;

    // ===== SECCIÓN 2: ANÁLISIS DE INTERVENCIONES POR EJES =====
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('2. Análisis de Intervenciones por Ejes de Gestión', 14, y); y += 6;
    
    // Agregación por Eje
    const ejeSummary = {};
    filteredReportes.forEach(r => {
      const eConfig = EJE_CONFIG[r.categoria] || DEFAULT_EJE;
      if (!ejeSummary[eConfig.eje]) {
        ejeSummary[eConfig.eje] = { count: 0, desc: eConfig.desc };
      }
      ejeSummary[eConfig.eje].count++;
    });

    const tableBody = Object.entries(ejeSummary).map(([eje, data]) => [
      eje,
      data.count.toLocaleString('es-PE'),
      data.desc
    ]);

    doc.autoTable({
      startY: y,
      head: [['Eje de Intervención', 'Frecuencia', 'Descripción de Actividades']],
      body: tableBody,
      styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
      headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 12;

    // ===== SECCIÓN 3: DISTRIBUCIÓN TERRITORIAL (17 SECTORES) =====
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('3. Análisis de Incidencia por Sectores Oficiales', 14, y); y += 8;
    
    // Agregación por Sector con nombres reales
    const sectorStats = {};
    reportes.forEach(r => {
      const realName = SECTOR_NAMES[r.sector] || r.sector || 'Zonas No Delimitadas';
      sectorStats[realName] = (sectorStats[realName] || 0) + 1;
    });

    const topZones = Object.entries(sectorStats).sort((a,b) => b[1]-a[1]).slice(0, 5);
    
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    
    topZones.forEach(([name, count], idx) => {
      doc.setFont(undefined, 'bold'); doc.text(`${idx + 1}. ${name} (${count} incidencias):`, 14, y);
      doc.setFont(undefined, 'normal');
      const zoneDesc = zoneDescriptions[name] || `Sector estratégico que requiere monitoreo preventivo según la tendencia detectada en el sistema de gestión territorial.`;
      
      const splitZoneDesc = doc.splitTextToSize(zoneDesc, w - 28);
      doc.text(splitZoneDesc, 14, y + 4.5);
      y += (splitZoneDesc.length * 5) + 6;
      
      if (y > 270) { doc.addPage(); y = 20; }
    });

    y += 4;

    // ===== SECCIÓN 4: CONCLUSIONES Y RECOMENDACIONES =====
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text('4. Conclusiones y Recomendaciones', 14, y); y += 8;
    doc.setFontSize(9); doc.setFont(undefined, 'normal');
    
    // Recomendaciones específicas
    config.recommendations.forEach(item => {
      doc.text(item, 14, y);
      y += 6;
    });

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

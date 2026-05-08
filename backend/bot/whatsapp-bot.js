// ===== SGTI Municipal — WhatsApp Bot Inteligente =====
// Escucha grupos de WhatsApp, clasifica mensajes, geocodifica direcciones,
// y guarda reportes en la BD MySQL.

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { analyzeMessage, isMonitoredGroup, GRUPOS_CONFIG } = require('./classifier');
const { geocodeAddress } = require('./geocoder');

let client;
let currentQR = null;
let isAuthenticated = false;
let connectedGroups = []; // Grupos reales detectados
let lastLog = 'Esperando inicio de sistema...';

// Referencia al modelo BD (se inicializa lazy para evitar dependencias circulares)
let MensajeWhatsapp = null;

// Fallback: array en memoria si la BD no está disponible
const reportesMemory = [];

/**
 * Obtiene el modelo de BD (lazy load)
 */
function getModel() {
  if (!MensajeWhatsapp) {
    try {
      const Models = require('../database/models');
      MensajeWhatsapp = Models.MensajeWhatsapp;
    } catch (e) {
      console.error('⚠️ No se pudo cargar modelo MensajeWhatsapp:', e.message);
    }
  }
  return MensajeWhatsapp;
}

/**
 * Genera el siguiente ID de reporte
 */
async function getNextReportId() {
  const Model = getModel();
  if (Model) {
    try {
      const count = await Model.count();
      return 'RPT-' + String(count + 1).padStart(3, '0');
    } catch (e) {
      return 'RPT-' + String(reportesMemory.length + 1).padStart(3, '0');
    }
  }
  return 'RPT-' + String(reportesMemory.length + 1).padStart(3, '0');
}

/**
 * Guarda un reporte en la BD o en memoria
 */
async function saveReport(reporte) {
  const Model = getModel();
  if (Model) {
    try {
      await Model.create({
        idString: reporte.id,
        fecha: reporte.fecha,
        grupo: reporte.grupo,
        grupoWhatsapp: reporte.grupoWhatsapp,
        reportadoPor: reporte.reportadoPor,
        telefono: reporte.telefono,
        mensaje: reporte.mensaje,
        categoria: reporte.categoria,
        prioridad: reporte.prioridad,
        sector: reporte.sector,
        ubicacion: reporte.ubicacion,
        direccionExtraida: reporte.direccionExtraida,
        lat: reporte.lat,
        lng: reporte.lng,
        estado: reporte.estado,
        asignadoA: reporte.asignadoA,
        notas: reporte.notas,
        fotoUrl: reporte.fotoUrl,
        areasDerivadas: JSON.stringify(reporte.areasDerivadas),
        esDerivacionMultiple: reporte.esDerivacionMultiple,
      });
      console.log(`💾 Reporte ${reporte.id} guardado en BD MySQL`);
      return true;
    } catch (err) {
      console.error(`❌ Error guardando en BD: ${err.message}. Guardando en memoria.`);
    }
  }

  // Fallback a memoria
  reportesMemory.unshift(reporte);
  console.log(`📝 Reporte ${reporte.id} guardado en memoria (fallback)`);
  return false;
}

/**
 * Inicializa el bot de WhatsApp
 */
const initWhatsAppBot = () => {
  console.log('');
  console.log('  🤖 ═══════════════════════════════════════');
  console.log('  🤖  WhatsApp Bot Inteligente v2.0');
  console.log('  🤖  Clasificación + Geocodificación + BD');
  console.log('  🤖 ═══════════════════════════════════════');
  console.log('');

  // Detectar OS para Chrome path
  const isWindows = process.platform === 'win32';
  
  // Intentar detectar ruta de Chrome en Linux (común en Hostinger/VPS)
  const puppeteerConfig = isWindows
    ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    : {
        executablePath: require('fs').existsSync('/usr/bin/google-chrome-stable') 
          ? '/usr/bin/google-chrome-stable' 
          : (require('fs').existsSync('/usr/bin/chromium-browser') ? '/usr/bin/chromium-browser' : undefined),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      };

  lastLog = 'Iniciando Navegador (Puppeteer)...';
  console.log('  ⏳ ' + lastLog);
  
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './bot-session' }),
    webVersion: '2.2412.54',
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/{version}.html',
    },
    puppeteer: {
      ...puppeteerConfig,
      headless: true,
      handleSIGINT: false, // Evita cierres accidentales
      args: [
        ...(puppeteerConfig.args || []),
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    },
  });

  lastLog = 'Inicializando cliente WhatsApp...';
  console.log('  ⏳ ' + lastLog);

  client.on('loading_screen', (percent, message) => {
    lastLog = `Cargando: ${percent}% - ${message}`;
    console.log(`  ⏳ ${lastLog}`);
  });

  client.on('qr', async (qr) => {
    lastLog = 'Esperando escaneo de código QR';
    console.log('  📱 [QR] Código generado — ¡Escanea ahora!');
    try {
      currentQR = await qrcode.toDataURL(qr);
      isAuthenticated = false;
    } catch (err) {
      lastLog = 'Error al generar código QR';
      console.error('  ❌ Error generando QR:', err);
    }
  });

  client.on('authenticated', () => {
    lastLog = 'Autenticado. Cargando chats...';
    console.log('  ✅ [AUTH] Sesión autenticada correctamente');
  });

  client.on('auth_failure', msg => {
    lastLog = 'Error de autenticación: ' + msg;
    console.error('  ❌ [AUTH] Fallo de autenticación:', msg);
  });

  client.on('ready', async () => {
    lastLog = 'Bot conectado y activo';
    console.log('');
    console.log('  ✅ [READY] WhatsApp Bot conectado y listo!');
    isAuthenticated = true;
    currentQR = null;

    // Listar los grupos conectados (Pequeño retraso para dar tiempo a cargar chats)
    setTimeout(async () => {
      try {
        const chats = await client.getChats();
        const groups = chats.filter(c => c.isGroup);
        // Obtener vinculaciones manuales de la BD para comparar
        const Models = require('../database/models');
        const manualLinks = await Models.GrupoVinculado.findAll();
        const manualMap = {};
        manualLinks.forEach(m => {
          manualMap[m.remoteId] = { areaId: m.areaId, monitoreado: m.monitoreado };
        });

        connectedGroups = groups.map(g => {
          const remoteId = g.id._serialized;
          const manual = manualMap[remoteId];
          
          let areaId = null;
          let isMonitored = false;

          if (manual) {
            areaId = manual.areaId;
            isMonitored = manual.monitoreado;
          } else {
            const areaMatch = Object.entries(GRUPOS_CONFIG).find(([_, config]) =>
              config.keywords.some(k => g.name.toLowerCase().includes(k))
            );
            if (areaMatch) {
              areaId = areaMatch[0];
              isMonitored = true;
            }
          }

          return {
            name: g.name || 'Grupo sin nombre',
            id: remoteId,
            participants: g.participants?.length || 0,
            isMonitored,
            isManual: !!manual,
            area: areaId,
            areaNombre: areaId ? (GRUPOS_CONFIG[areaId]?.nombre || areaId) : 'No vinculado',
          };
        });

        const monitored = connectedGroups.filter(g => g.isMonitored);
        console.log(`  📋 ${groups.length} grupos encontrados, ${monitored.length} monitoreados:`);
        monitored.forEach(g => {
          console.log(`     ✅ "${g.name}" → ${g.areaNombre}`);
        });
        const unmonitored = connectedGroups.filter(g => !g.isMonitored);
        if (unmonitored.length > 0) {
          console.log(`     ⚪ ${unmonitored.length} grupos no vinculados`);
        }
        console.log('');
      } catch (err) {
        console.error('Error listando grupos:', err.message);
      }
    }, 2000);
  });

  /**
   * Refresca el estado de monitoreo de los grupos conectados basándose en la BD
   */
  async function refreshConnectedGroupsStatus() {
    try {
      const Models = require('../database/models');
      const manualLinks = await Models.GrupoVinculado.findAll();
      const manualMap = {};
      manualLinks.forEach(m => {
        manualMap[m.remoteId] = { areaId: m.areaId, monitoreado: m.monitoreado };
      });

      connectedGroups = connectedGroups.map(g => {
        const manual = manualMap[g.id];
        if (manual) {
          return {
            ...g,
            isMonitored: manual.monitoreado,
            area: manual.areaId,
            areaNombre: manual.areaId ? (GRUPOS_CONFIG[manual.areaId]?.nombre || manual.areaId) : 'No vinculado',
          };
        }
        return g;
      });
    } catch (err) {
      console.error('Error refrescando estado de grupos:', err.message);
    }
  }
  // Exponer para uso externo
  global._refreshWspGroups = refreshConnectedGroupsStatus;

  client.on('message', async msg => {
    try {
      const chat = await msg.getChat();
      const chatName = chat.name || '';

      // Registrar solo grupos vinculados y monitoreados
      const remoteId = chat.id._serialized;
      if (chat.isGroup && !isMonitoredGroup(chatName, remoteId)) {
        return; // Ignorar totalmente si no está vinculado/activo
      }

      // Ignorar estados y mensajes de solo media sin texto
      if (msg.isStatus) return;
      if (!msg.body && msg.type !== 'location') return;

      console.log(`📩 [${chatName}]: ${msg.body?.substring(0, 80) || '(ubicación)'}...`);

      // 1. CLASIFICAR — Análisis inteligente del mensaje (Pasamos remoteId para prioridad DB)
      const analysis = analyzeMessage(msg.body || '', chatName, remoteId);

      // 2. GEOCODIFICAR — Convertir dirección a coordenadas
      let lat = null;
      let lng = null;

      // Si es ubicación GPS nativa de WhatsApp
      if (msg.type === 'location') {
        lat = msg.location.latitude;
        lng = msg.location.longitude;
        analysis.direccionExtraida = msg.location.description || 'Ubicación GPS compartida';
      }
      // Si se extrajo dirección del texto, geocodificar
      else if (analysis.direccionExtraida) {
        const coords = await geocodeAddress(analysis.direccionExtraida);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      // 3. CREAR REPORTE
      const reportId = await getNextReportId();
      const nuevoReporte = {
        id: reportId,
        fecha: new Date().toISOString(),
        grupo: analysis.areaPrincipal,
        grupoWhatsapp: chatName,
        reportadoPor: msg._data?.notifyName || msg.from?.split('@')[0] || 'Desconocido',
        telefono: msg.from?.split('@')[0] || '',
        mensaje: msg.body || '(Ubicación compartida)',
        categoria: analysis.categoria,
        prioridad: analysis.prioridad,
        sector: analysis.sector,
        ubicacion: analysis.direccionExtraida || 'Por determinar',
        direccionExtraida: analysis.direccionExtraida || null,
        lat: lat,
        lng: lng,
        estado: 'nuevo',
        asignadoA: null,
        notas: chat.isGroup
          ? `Grupo: ${chatName} | Áreas: ${analysis.areasDerivadas.join(', ')}`
          : 'Mensaje directo',
        fotoUrl: null,
        areasDerivadas: analysis.areasDerivadas,
        esDerivacionMultiple: analysis.esDerivacionMultiple,
      };

      // 4. GUARDAR
      await saveReport(nuevoReporte);

      // Log de derivación
      if (analysis.esDerivacionMultiple) {
        console.log(`🔀 Derivación múltiple: ${analysis.areasDerivadas.join(' + ')}`);
      }
      console.log(`📥 ${reportId} → Área: ${analysis.areaPrincipal} | Cat: ${analysis.categoria} | Prior: ${analysis.prioridad}${lat ? ` | 📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}` : ''}`);

    } catch (err) {
      console.error('❌ Error procesando mensaje:', err);
    }
  });

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp desconectado:', reason);
    isAuthenticated = false;
    connectedGroups = [];
  });

  client.initialize().catch(err => {
    console.error('Error inicializando WhatsApp:', err.message);
  });

  // SISTEMA DE VIGILANCIA (Keep-Alive)
  // Cada 5 minutos verificamos si el bot sigue vivo
  setInterval(async () => {
    if (!isAuthenticated) {
      console.log('🔄 [VIGILANCIA] Bot detectado como desconectado. Intentando re-inicializar...');
      try {
        await client.initialize();
      } catch (e) {
        console.error('❌ [VIGILANCIA] Fallo al re-inicializar:', e.message);
      }
    }
  }, 1000 * 60 * 5); 
};

/**
 * Obtiene el estado actual del bot
 */
const getWhatsAppStatus = () => {
  // Intentar refrescar antes de enviar si global._refreshWspGroups existe
  if (global._refreshWspGroups) global._refreshWspGroups();

  return {
    isAuthenticated,
    qrCode: currentQR,
    lastLog,
    connectedGroups: connectedGroups,
    monitoredCount: connectedGroups.filter(g => g.isMonitored).length,
    totalGroups: connectedGroups.length,
  };
};

/**
 * Obtiene los reportes en memoria (fallback)
 */
const getMemoryReportes = () => reportesMemory;

/**
 * Cierra la sesión de WhatsApp
 */
const logoutWhatsApp = async () => {
  if (client) {
    try {
      await client.logout();
      await client.destroy();
      isAuthenticated = false;
      currentQR = null;
      connectedGroups = [];
      // Volver a inicializar para quedar a la espera de un nuevo QR
      initWhatsAppBot();
      return { success: true };
    } catch (err) {
      console.error('Error al cerrar sesión:', err.message);
      throw err;
    }
  }
  return { success: false, message: 'No hay cliente activo' };
};

module.exports = {
  initWhatsAppBot,
  getWhatsAppStatus,
  getMemoryReportes,
  logoutWhatsApp,
  getClient: () => client,
};

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
let isInitializing = false;
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
      // === Buscar supervisor de turno automáticamente ===
      let supervisorAsignado = null;
      try {
        const Models = require('../database/models');
        if (Models.Configuracion) {
          const hora = new Date(reporte.fecha || new Date()).getHours();
          let claveTurno = 'supervisor_noche'; // 22:00 - 06:00
          if (hora >= 6 && hora < 14) claveTurno = 'supervisor_manana';
          else if (hora >= 14 && hora < 22) claveTurno = 'supervisor_tarde';

          const config = await Models.Configuracion.findOne({ where: { clave: claveTurno } });
          if (config && config.valor) {
            supervisorAsignado = config.valor;
            console.log(`✅ [Bot] Supervisor de turno asignado: ${config.valor} (${claveTurno})`);
          }
        }
      } catch (supErr) {
        console.warn('⚠️ [Bot] No se pudo asignar supervisor de turno:', supErr.message);
      }

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
        supervisor: supervisorAsignado
      });
      console.log(`💾 Reporte ${reporte.id} guardado en BD MySQL con supervisor: ${supervisorAsignado}`);
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
    // webVersion: '2.3000.1012170016', // Versión más estable o dejar por defecto
    puppeteer: {
      executablePath: '/usr/bin/google-chrome-stable',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      authTimeoutMs: 60000, // 60 segundos de margen
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
    isInitializing = false;
  });

  client.on('auth_failure', msg => {
    lastLog = 'Error de autenticación: ' + msg;
    console.error('  ❌ [AUTH] Fallo de autenticación:', msg);
    isInitializing = false;
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

        connectedGroups = [];
        for (const g of groups) {
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
              // AUTO-VINCULAR EN BD — ¡ESTO SOLUCIONA EL PROBLEMA!
              try {
                await Models.GrupoVinculado.create({
                  remoteId: remoteId,
                  nombre: g.name,
                  areaId: areaId,
                  monitoreado: true
                });
                console.log(`✨ Grupo auto-vinculado: ${g.name} -> ${areaId}`);
              } catch (e) { /* Ya existe o error menor */ }
            }
          }

          connectedGroups.push({
            name: g.name || 'Grupo sin nombre',
            id: remoteId,
            participants: g.participants?.length || 0,
            isMonitored,
            isManual: !!manual,
            area: areaId,
            areaNombre: areaId ? (GRUPOS_CONFIG[areaId]?.nombre || areaId) : 'No vinculado',
          });
        }

        // Sincronizar cache de clasificación inmediatamente
        const { syncGruposVinculados } = require('./classifier');
        await syncGruposVinculados();

        const monitored = connectedGroups.filter(g => g.isMonitored);
        console.log(`  📋 ${groups.length} grupos encontrados, ${monitored.length} monitoreados.`);
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
      const monitored = isMonitoredGroup(chatName, remoteId);

      if (chat.isGroup && !monitored) {
        console.log(`ℹ️ Mensaje ignorado (Grupo no activo): [${chatName}] - ID: ${remoteId}`);
        return;
      }

      // Ignorar estados y mensajes de solo media sin texto (Corregido para permitir fotos)
      if (msg.isStatus) return;
      if (!msg.body && msg.type !== 'location' && !msg.hasMedia) return;

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

      // 3. CAPTURAR MULTIMEDIA (FOTOS) - Con timeout y manejo de error para no perder el reporte
      let fotoUrl = null;
      if (msg.hasMedia) {
        try {
          console.log(`📸 Descargando multimedia para [${chatName}]...`);
          // Timeout de 15 segundos para la descarga
          const mediaPromise = msg.downloadMedia();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout descarga')), 15000)
          );
          
          const media = await Promise.race([mediaPromise, timeoutPromise]);
          
          if (media && media.mimetype.startsWith('image/')) {
            fotoUrl = `data:${media.mimetype};base64,${media.data}`;
            console.log(`✅ Foto procesada con éxito`);
          }
        } catch (e) {
          console.error(`⚠️ Error multimedia (${chatName}): ${e.message}. Se guardará el reporte sin foto.`);
        }
      }

      // 4. CREAR REPORTE
      const reportId = await getNextReportId();
      const nuevoReporte = {
        id: reportId,
        fecha: new Date().toISOString(),
        grupo: analysis.areaPrincipal,
        grupoWhatsapp: chatName,
        reportadoPor: msg._data?.notifyName || msg.from?.split('@')[0] || 'Desconocido',
        telefono: msg.from?.split('@')[0] || '',
        mensaje: msg.body || (msg.type === 'location' ? '(Ubicación compartida)' : '(Imagen)'),
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
        fotoUrl: fotoUrl, // Ya no es null
        areasDerivadas: analysis.areasDerivadas,
        esDerivacionMultiple: analysis.esDerivacionMultiple,
      };

      // 5. GUARDAR Y SINCRONIZAR FEED EN VIVO
      await saveReport(nuevoReporte);

      // Inyectar en el feed de memoria para que el dashboard lo vea en tiempo real
      const { whatsappFeeds } = require('../data/mock-data');
      if (whatsappFeeds[nuevoReporte.grupo]) {
        whatsappFeeds[nuevoReporte.grupo].unshift({
          id: nuevoReporte.id,
          time: 'Ahora',
          fecha: nuevoReporte.fecha,
          sender: nuevoReporte.reportadoPor,
          body: nuevoReporte.mensaje,
          tags: [nuevoReporte.prioridad, 'WSP'],
          color: nuevoReporte.prioridad === 'Alta' ? '#f87171' : '#fbbf24',
          category: nuevoReporte.categoria,
          lat: nuevoReporte.lat,
          lng: nuevoReporte.lng,
          ubicacion: nuevoReporte.ubicacion,
          fotoUrl: nuevoReporte.fotoUrl,
          sentiment: analysis.sentiment || 'neutral'
        });
        // Mantener el feed manejable (máx 50 mensajes en memoria)
        if (whatsappFeeds[nuevoReporte.grupo].length > 50) {
          whatsappFeeds[nuevoReporte.grupo].pop();
        }
      }

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

  isInitializing = true;
  client.initialize().catch(err => {
    console.error('Error inicializando WhatsApp:', err.message);
    isInitializing = false;
  });

  // SISTEMA DE VIGILANCIA (Keep-Alive)
  setInterval(async () => {
    if (!isAuthenticated && !isInitializing) {
      console.log('🔄 [VIGILANCIA] Bot detectado como desconectado. Intentando re-inicializar...');
      try {
        isInitializing = true;
        await client.initialize();
      } catch (e) {
        console.error('❌ [VIGILANCIA] Fallo al re-inicializar:', e.message);
        isInitializing = false;
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

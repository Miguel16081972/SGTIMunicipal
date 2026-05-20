// ===== SGTI Municipal — WhatsApp API Routes =====
// Lee/escribe reportes desde la BD MySQL (MensajeWhatsapp)
// con fallback a datos mock + memoria

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { whatsappTrending, whatsappGrupos, whatsappFeeds, whatsappReportes } = require('../data/mock-data');
const { MensajeWhatsapp, GrupoVinculado } = require('../database/models');
const { GRUPOS_CONFIG } = require('../bot/classifier');
const router = express.Router();

// Helper: tiempo transcurrido
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " años";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " días";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min";
  return Math.floor(seconds) + " seg";
}

// Helper: obtener modelo BD
function getModel() {
  try {
    return require('../database/models').MensajeWhatsapp;
  } catch (e) {
    return null;
  }
}

// Helper: check si BD está conectada
function isDbConnected() {
  try {
    const db = require('../database/db');
    return db.isConnected();
  } catch (e) {
    return false;
  }
}

// ===== DASHBOARD GENERAL =====

// GET / — Panel general de WhatsApp
router.get('/', async (req, res) => {
  try {
    const Model = getModel();
    if (Model && isDbConnected()) {
      const { Sequelize } = require('sequelize');
      const counts = await Model.findAll({
        attributes: [
          ['grupo', 'id'],
          [Sequelize.fn('COUNT', Sequelize.col('idString')), 'total']
        ],
        group: ['grupo']
      });

      // Mapear a la estructura que espera el frontend
      const gruposReales = {};
      const config = require('../bot/classifier').GRUPOS_CONFIG;

      // Variaciones de nombres para agrupar conteos
      const nameMap = {
        'seguridad': ['seguridad', 'Seg. Ciudadana', 'Seguridad Ciudadana', 'Seguridad'],
        'ambiental': ['ambiental', 'Des. Ambiental', 'Desarrollo Ambiental', 'Ambiental'],
        'urbano': ['urbano', 'Des. Urbano', 'Desarrollo Urbano', 'Urbano'],
        'humano': ['humano', 'Des. Humano', 'Desarrollo Humano', 'Humano'],
        'rentas': ['rentas', 'Rentas'],
        'municipal': ['municipal', 'Gerencia Municipal', 'Ger. Municipal']
      };

      Object.keys(config).forEach(id => {
        // Sumar todos los mensajes que coincidan con las variaciones de este ID
        const variants = nameMap[id] || [id];
        const dbCount = counts.filter(c => variants.includes(c.getDataValue('id')))
          .reduce((acc, c) => acc + parseInt(c.getDataValue('total')), 0);

        gruposReales[id] = {
          nombre: config[id].nombre,
          icon: config[id].icon,
          total: dbCount || 0,
          color: config[id].color || 'blue',
          status: 'Activo'
        };
      });

      return res.json({ trending: whatsappTrending, grupos: gruposReales });
    }

    // Fallback si no hay BD
    res.json({ trending: whatsappTrending, grupos: whatsappGrupos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ESTADO DEL BOT =====
// GET /api/whatsapp/status
router.get('/status', (req, res) => {
  const { getWhatsAppStatus } = require('../bot/whatsapp-bot');
  res.json(getWhatsAppStatus());
});

// ===== CONFIGURACIÓN =====
// GET /api/whatsapp/config — Ver configuración de clasificación
router.get('/config', (req, res) => {
  const { INCIDENCIAS } = require('../bot/classifier');
  res.json({
    grupos: GRUPOS_CONFIG,
    incidencias: INCIDENCIAS.map(i => ({
      categoria: i.categoria,
      keywords: i.keywords,
      prioridad: i.prioridad,
      areas: i.areas
    })),
    totalCategorias: INCIDENCIAS.length,
    totalGrupos: Object.keys(GRUPOS_CONFIG).length,
  });
});

// ===== GRUPOS CONECTADOS =====
// GET /api/whatsapp/grupos-conectados
router.get('/grupos-conectados', (req, res) => {
  const { getWhatsAppStatus } = require('../bot/whatsapp-bot');
  const status = getWhatsAppStatus();
  res.json({
    isAuthenticated: status.isAuthenticated,
    grupos: status.connectedGroups,
    monitoreados: status.monitoredCount,
    total: status.totalGroups,
  });
});

// ===== FEED =====
// GET /api/whatsapp/feed/:grupo
router.get('/feed/:grupo', async (req, res) => {
  const grupo = req.params.grupo;

  // Bypass de seguridad para administradores
  const isAdmin = req.user && (req.user.rol === 'admin' || req.user.gerencia === 'all');

  if (!isAdmin && req.user && req.user.gerencia !== grupo) {
    return res.status(403).json({ error: 'No tienes permiso para ver el feed de esta gerencia.' });
  }

  // Intentar leer de BD: últimos mensajes de este grupo
  const Model = getModel();

  try {
    if (Model) {
      const { Op } = require('sequelize');
      const securityCategories = ['Robo / Asalto', 'Comercio Informal', 'Pelea Callejera', 'Persona Sospechosa', 'Ruido Excesivo'];

      const feedVariants = {
        'seguridad': ['seguridad', 'Seguridad Ciudadana', 'Seg. Ciudadana', 'Seguridad'],
        'ambiental': ['ambiental', 'Desarrollo Ambiental', 'Des. Ambiental', 'Ambiental'],
        'urbano': ['urbano', 'Desarrollo Urbano', 'Des. Urbano', 'Urbano'],
        'humano': ['humano', 'Desarrollo Humano', 'Des. Humano', 'Humano'],
        'rentas': ['rentas', 'Rentas'],
        'municipal': ['municipal', 'Gerencia Municipal', 'Ger. Municipal']
      };

      const variants = feedVariants[grupo] || [grupo];

      const { from, to } = req.query;
      const where = {
        [Op.or]: [
          { grupo: { [Op.in]: variants } },
          { categoria: { [Op.in]: grupo === 'seguridad' ? securityCategories : [] } },
          { areasDerivadas: { [Op.like]: `%${grupo}%` } }
        ]
      };

      // Filtro por fecha (Opcional)
      if (from || to) {
        where.fecha = {};
        if (from) where.fecha[Op.gte] = new Date(from + 'T00:00:00');
        if (to) where.fecha[Op.lte] = new Date(to + 'T23:59:59');
      }

      const mensajes = await Model.findAll({
        where,
        order: [['fecha', 'DESC']],
        limit: (from || to) ? 500 : 100, // 100 por defecto para velocidad, 500 con filtros
      });

      if (mensajes && mensajes.length > 0) {
        const feed = mensajes.map(m => {
          const prioridadColor = { Alta: '#f87171', Media: '#fbbf24', Baja: '#34d399' };
          return {
            id: m.idString,
            time: getTimeAgo(m.fecha),
            fecha: m.fecha,
            sender: m.reportadoPor || 'Desconocido',
            body: m.mensaje,
            tags: [m.prioridad, m.direccionExtraida ? 'Predio' : 'Zona aprox.'],
            lat: m.lat ? parseFloat(m.lat) : null,
            lng: m.lng ? parseFloat(m.lng) : null,
            ubicacion: m.ubicacion || m.direccionExtraida || null,
            color: prioridadColor[m.prioridad] || '#fbbf24',
            sentiment: m.prioridad === 'Alta' ? 'negativo' : m.prioridad === 'Baja' ? 'positivo' : 'neutral',
            category: m.categoria,
            areasDerivadas: m.areasDerivadas ? JSON.parse(m.areasDerivadas) : [grupo],
            esDerivacionMultiple: m.esDerivacionMultiple || false,
            fotoUrl: m.fotoUrl
          };
        });
        return res.json({ grupo, feed, source: 'database' });
      }
    }
  } catch (err) {
    console.error('❌ [FEED ERROR]:', err.message);
  }

  // Fallback a datos mock si falla la BD o no hay mensajes
  const feed = whatsappFeeds[grupo] || [];
  res.json({ grupo, feed, source: 'mock' });
});

// ===== REPORTES =====

// GET /api/whatsapp/reportes — Todos los reportes con filtros
router.get('/reportes', async (req, res) => {
  const { estado, grupo, prioridad, sector, orden, from, to } = req.query;

  const Model = getModel();

  // Intentar leer de BD
  if (Model) {
    try {
      const where = {};
      const { Op } = require('sequelize');

      console.log(`🔍 [REPORTE DEBUG] Filtros: grupo=${grupo}, estado=${estado}, prioridad=${prioridad}, userGerencia=${req.user?.gerencia}`);

      if (estado && estado !== 'todos') where.estado = estado;
      if (grupo && grupo !== 'todos') {
        const nameMap = {
          'seguridad': ['seguridad', 'Seg. Ciudadana', 'Seguridad Ciudadana', 'Seguridad'],
          'ambiental': ['ambiental', 'Desarrollo Ambiental', 'Des. Ambiental', 'Ambiental'],
          'urbano': ['urbano', 'Desarrollo Urbano', 'Des. Urbano', 'Urbano'],
          'humano': ['humano', 'Desarrollo Humano', 'Des. Humano', 'Humano'],
          'rentas': ['rentas', 'Rentas'],
          'municipal': ['municipal', 'Gerencia Municipal', 'Ger. Municipal']
        };
        const variants = nameMap[grupo] || [grupo];

        // Buscar tanto en grupo principal como en areasDerivadas usando las variantes
        where[Op.or] = [
          { grupo: { [Op.in]: variants } },
          { areasDerivadas: { [Op.like]: `%${grupo}%` } }
        ];
      }
      if (prioridad && prioridad !== 'todas') where.prioridad = prioridad;
      if (sector && sector !== 'todos') where.sector = sector;

      // Filtro RBAC (Bypass para Admin o Sesión no iniciada temporalmente)
      const isAdmin = req.user && (req.user.rol === 'admin' || req.user.gerencia === 'all');
      const noUser = !req.user;

      if (noUser) {
        console.log('⚠️ [REPORTE RBAC] Acceso sin sesión detectado. Permitiendo vista global por emergencia.');
      }

      if (!isAdmin && !noUser) {
        const uGerencia = req.user.gerencia;
        const nameMap = {
          'seguridad': ['seguridad', 'Seg. Ciudadana', 'Seguridad Ciudadana', 'Seguridad'],
          'ambiental': ['ambiental', 'Des. Ambiental', 'Desarrollo Ambiental', 'Ambiental'],
          'urbano': ['urbano', 'Des. Urbano', 'Desarrollo Urbano', 'Urbano'],
          'humano': ['humano', 'Des. Humano', 'Desarrollo Humano', 'Humano'],
          'rentas': ['rentas', 'Rentas'],
          'municipal': ['municipal', 'Gerencia Municipal', 'Ger. Municipal']
        };
        const uVariants = nameMap[uGerencia] || [uGerencia];

        console.log(`🛡️ [REPORTE RBAC] Aplicando filtro para: ${uGerencia}`);
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push({
          [Op.or]: [
            { grupo: { [Op.in]: uVariants } },
            { areasDerivadas: { [Op.like]: `%${uGerencia}%` } }
          ]
        });
      }

      if (from && to) {
        where.fecha = { [Op.between]: [new Date(from), new Date(to + 'T23:59:59.999Z')] };
      }

      console.log(`📝 [REPORTE QUERY] Where:`, JSON.stringify(where));

      const queryLimit = (from && to) ? 1000 : 100;
      const mensajes = await Model.findAll({
        where,
        order: [['fecha', orden === 'antiguo' ? 'ASC' : 'DESC']],
        limit: queryLimit
      });

      const reportes = mensajes.map(formatReporteFromDB);

      // Stats — Respetar filtros de fecha para que KPIs reflejen el periodo seleccionado
      const statsWhere = {};
      if (from && to) {
        statsWhere.fecha = { [Op.between]: [new Date(from), new Date(to + 'T23:59:59.999Z')] };
      }

      // RBAC para stats
      const isAdminStats = req.user && (req.user.rol === 'admin' || req.user.gerencia === 'all');
      if (!isAdminStats && req.user) {
        const uGerencia = req.user.gerencia;
        const uNameMap = {
          'seguridad': ['seguridad', 'Seg. Ciudadana', 'Seguridad Ciudadana', 'Seguridad'],
          'ambiental': ['ambiental', 'Des. Ambiental', 'Desarrollo Ambiental', 'Ambiental'],
          'urbano': ['urbano', 'Des. Urbano', 'Desarrollo Urbano', 'Urbano'],
          'humano': ['humano', 'Des. Humano', 'Desarrollo Humano', 'Humano'],
          'rentas': ['rentas', 'Rentas'],
          'municipal': ['municipal', 'Gerencia Municipal', 'Ger. Municipal']
        };
        const uVariants = uNameMap[uGerencia] || [uGerencia];
        statsWhere[Op.or] = [
          { grupo: { [Op.in]: uVariants } },
          { areasDerivadas: { [Op.like]: `%${uGerencia}%` } }
        ];
      }

      const allFiltered = await Model.findAll({ where: statsWhere });
      const allMensajes = allFiltered.map(formatReporteFromDB);
      const stats = {
        total: allMensajes.length,
        nuevo: allMensajes.filter(m => m.estado === 'nuevo').length,
        en_proceso: allMensajes.filter(m => m.estado === 'en_proceso').length,
        atendido: allMensajes.filter(m => m.estado === 'atendido').length,
        alta: allMensajes.filter(m => m.prioridad === 'Alta').length,
        porGrupo: Object.keys(GRUPOS_CONFIG).reduce((acc, g) => {
          if (req.user && req.user.gerencia !== 'all' && req.user.gerencia !== g) return acc;

          const nameMap = {
            'seguridad': ['seguridad', 'Seg. Ciudadana', 'Seguridad Ciudadana', 'Seguridad'],
            'ambiental': ['ambiental', 'Des. Ambiental', 'Desarrollo Ambiental', 'Ambiental'],
            'urbano': ['urbano', 'Des. Urbano', 'Desarrollo Urbano', 'Urbano'],
            'humano': ['humano', 'Des. Humano', 'Desarrollo Humano', 'Humano'],
            'rentas': ['rentas', 'Rentas'],
            'municipal': ['municipal', 'Gerencia Municipal', 'Ger. Municipal']
          };
          const variants = nameMap[g] || [g];

          acc[g] = allMensajes.filter(m => {
            if (variants.includes(m.grupo)) return true;
            try {
              return m.areasDerivadas && m.areasDerivadas.some(area => variants.includes(area));
            } catch { return false; }
          }).length;
          return acc;
        }, {}),
      };

      return res.json({ reportes, stats, filtrosActivos: { estado, grupo, prioridad, sector, from, to }, source: 'database' });
    } catch (err) {
      console.error('Error leyendo reportes de BD:', err.message);
    }
  }

  // Fallback a memoria
  const { getMemoryReportes } = require('../bot/whatsapp-bot');
  let allReportes = [...getMemoryReportes()];

  let reportes = [...allReportes];
  if (estado && estado !== 'todos') reportes = reportes.filter(r => r.estado === estado);
  if (grupo && grupo !== 'todos') {
    reportes = reportes.filter(r => {
      if (r.grupo === grupo) return true;
      if (r.areasDerivadas && r.areasDerivadas.includes(grupo)) return true;
      return false;
    });
  }
  if (prioridad && prioridad !== 'todas') reportes = reportes.filter(r => r.prioridad === prioridad);
  if (sector && sector !== 'todos') reportes = reportes.filter(r => r.sector === sector);

  if (req.user && req.user.gerencia !== 'all') {
    const uGerencia = req.user.gerencia;
    reportes = reportes.filter(r => {
      if (r.grupo === uGerencia) return true;
      if (r.areasDerivadas && r.areasDerivadas.includes(uGerencia)) return true;
      return false;
    });
  }

  if (from && to) {
    const dFrom = new Date(from);
    const dTo = new Date(to + 'T23:59:59');
    reportes = reportes.filter(r => {
      const d = new Date(r.fecha);
      return d >= dFrom && d <= dTo;
    });
  }

  if (orden === 'antiguo') {
    reportes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  } else {
    reportes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  const stats = {
    total: allReportes.length,
    nuevo: allReportes.filter(r => r.estado === 'nuevo').length,
    en_proceso: allReportes.filter(r => r.estado === 'en_proceso').length,
    atendido: allReportes.filter(r => r.estado === 'atendido').length,
    alta: allReportes.filter(r => r.prioridad === 'Alta').length,
    porGrupo: Object.keys(GRUPOS_CONFIG).reduce((acc, g) => {
      if (req.user && req.user.gerencia !== 'all' && req.user.gerencia !== g) return acc;
      acc[g] = allReportes.filter(r => r.grupo === g).length;
      return acc;
    }, {}),
  };

  res.json({ reportes, stats, filtrosActivos: { estado, grupo, prioridad, sector, from, to }, source: 'memory' });
});

// GET /api/whatsapp/reportes/:id — Detalle de un reporte
router.get('/reportes/:id', async (req, res) => {
  const Model = getModel();

  // BD first
  if (Model) {
    try {
      const msg = await Model.findOne({ where: { idString: req.params.id } });
      if (msg) return res.json(formatReporteFromDB(msg));
    } catch (err) {
      console.error('Error buscando reporte en BD:', err.message);
    }
  }

  // Fallback
  const { getMemoryReportes } = require('../bot/whatsapp-bot');
  const all = [...getMemoryReportes()];
  const reporte = all.find(r => r.id === req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  res.json(reporte);
});

// PATCH /api/whatsapp/reportes/:id — Actualizar estado
router.patch('/reportes/:id', async (req, res) => {
  const { estado, asignadoA, notas, lat, lng, ubicacion, grupo } = req.body;
  const Model = getModel();

  // BD first
  if (Model) {
    try {
      const msg = await Model.findOne({ where: { idString: req.params.id } });
      if (msg) {
        if (estado) {
          msg.estado = estado;
          // Sincronizar también la memoria (feeds) para actualización inmediata sin recargar
          Object.keys(whatsappFeeds).forEach(g => {
            const msgInFeed = whatsappFeeds[g].find(m => m.body.includes(req.params.id) || (m.sender === msg.reportadoPor && m.body === msg.mensaje));
            if (msgInFeed) msgInFeed.estado = estado;
          });
        }
        if (asignadoA !== undefined) msg.asignadoA = asignadoA;
        if (notas !== undefined) msg.notas = notas;
        if (lat !== undefined) msg.lat = lat;
        if (lng !== undefined) msg.lng = lng;
        if (ubicacion !== undefined) msg.ubicacion = ubicacion;
        if (grupo !== undefined) msg.grupo = grupo;
        await msg.save();
        return res.json({ message: 'Reporte actualizado', reporte: formatReporteFromDB(msg) });

      }
    } catch (err) {
      console.error('Error actualizando reporte en BD:', err.message);
    }
  }

  // Fallback
  const { getMemoryReportes } = require('../bot/whatsapp-bot');
  const all = [...getMemoryReportes()];
  const reporte = all.find(r => r.id === req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

  if (estado) {
    reporte.estado = estado;
    // Sincronizar con los feeds de memoria para actualización inmediata en UI
    Object.keys(whatsappFeeds).forEach(g => {
      const msgInFeed = whatsappFeeds[g].find(m => m.body.includes(req.params.id) || (m.sender === reporte.reportadoPor && m.body === reporte.mensaje));
      if (msgInFeed) msgInFeed.estado = estado;
    });
  }
  if (asignadoA !== undefined) reporte.asignadoA = asignadoA;
  if (notas !== undefined) reporte.notas = notas;
  if (lat !== undefined) reporte.lat = lat;
  if (lng !== undefined) reporte.lng = lng;
  if (ubicacion !== undefined) reporte.ubicacion = ubicacion;
  if (grupo !== undefined) reporte.grupo = grupo;

  res.json({ message: 'Reporte actualizado', reporte });

});

// GET /api/whatsapp/stats — Obtiene estadísticas reales para el Dashboard
router.get('/stats', async (req, res) => {
  try {
    const { MensajeWhatsapp } = require('../database/models');
    const { Sequelize } = require('sequelize');

    // 1. Conteo por Gerencia (Área)
    const porGerencia = await MensajeWhatsapp.findAll({
      attributes: [
        ['grupo', 'area'],
        [Sequelize.fn('COUNT', Sequelize.col('idString')), 'total']
      ],
      group: ['grupo']
    });

    // 2. Conteo por Estado
    const porEstado = await MensajeWhatsapp.findAll({
      attributes: [
        'estado',
        [Sequelize.fn('COUNT', Sequelize.col('idString')), 'total']
      ],
      group: ['estado']
    });

    // 3. Últimos 7 días (Volumen diario)
    const hoy = new Date();
    const hace7dias = new Date(hoy.getTime() - (7 * 24 * 60 * 60 * 1000));
    const diario = await MensajeWhatsapp.findAll({
      where: {
        fecha: { [Sequelize.Op.gte]: hace7dias }
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('fecha')), 'dia'],
        [Sequelize.fn('COUNT', Sequelize.col('idString')), 'total']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('fecha'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('fecha')), 'ASC']]
    });

    // 4. Temas Tendencia (Últimas 24h)
    const hace24h = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    const tendencias = await MensajeWhatsapp.findAll({
      where: {
        fecha: { [Sequelize.Op.gte]: hace24h },
        categoria: { [Sequelize.Op.ne]: 'Sin clasificar' }
      },
      attributes: [
        ['categoria', 'tema'],
        [Sequelize.fn('COUNT', Sequelize.col('idString')), 'total']
      ],
      group: ['categoria'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('idString')), 'DESC']],
      limit: 6
    });

    res.json({
      porGerencia,
      porEstado,
      diario,
      tendencias,
      total: await MensajeWhatsapp.count()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/whatsapp/vincular — Vincula un grupo de WhatsApp a una gerencia manualmente
router.post('/vincular', async (req, res) => {
  const { remoteId, nombre, areaId, monitoreado } = req.body;
  if (!remoteId) return res.status(400).json({ error: 'Faltan datos (remoteId)' });

  try {
    const { GrupoVinculado } = require('../database/models');
    const { syncGruposVinculados } = require('../bot/classifier');

    // Buscar si ya existe para actualizarlo o crearlo
    const [vinculo, created] = await GrupoVinculado.findOrCreate({
      where: { remoteId },
      defaults: { nombre, areaId, monitoreado: monitoreado !== undefined ? monitoreado : true }
    });

    if (!created) {
      if (areaId !== undefined) vinculo.areaId = areaId;
      if (nombre !== undefined) vinculo.nombre = nombre;
      if (monitoreado !== undefined) vinculo.monitoreado = monitoreado;
      await vinculo.save();
    }

    // Sincronizar cache del bot inmediatamente
    await syncGruposVinculados();
    if (global._refreshWspGroups) global._refreshWspGroups();

    res.json({ message: 'Grupo actualizado con éxito', vinculo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/whatsapp/logout — Cerrar sesión de WhatsApp
router.post('/logout', async (req, res) => {
  try {
    const { logoutWhatsApp } = require('../bot/whatsapp-bot');
    const result = await logoutWhatsApp();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/whatsapp/webhook — Webhook para recibir mensajes (API externa)
router.post('/webhook', async (req, res) => {
  const { from, body, group, location } = req.body;
  const { analyzeMessage } = require('../bot/classifier');
  const { geocodeAddress } = require('../bot/geocoder');

  // Analizar el mensaje
  const analysis = analyzeMessage(body || '', group || '');

  // Geocodificar si hay dirección
  let lat = location?.lat || null;
  let lng = location?.lng || null;
  if (!lat && analysis.direccionExtraida) {
    const coords = await geocodeAddress(analysis.direccionExtraida);
    if (coords) { lat = coords.lat; lng = coords.lng; }
  }

  const Model = getModel();
  const id = 'RPT-' + String(Date.now()).slice(-6);

  const nuevoReporte = {
    id,
    fecha: new Date().toISOString(),
    grupo: analysis.areaPrincipal,
    grupoWhatsapp: group || 'webhook',
    reportadoPor: from || 'Desconocido',
    telefono: req.body.telefono || '',
    mensaje: body || '',
    categoria: analysis.categoria,
    prioridad: analysis.prioridad,
    sector: analysis.sector,
    ubicacion: analysis.direccionExtraida || req.body.ubicacion || '',
    direccionExtraida: analysis.direccionExtraida || null,
    lat, lng,
    estado: 'nuevo',
    asignadoA: null,
    notas: `Áreas: ${analysis.areasDerivadas.join(', ')}`,
    fotoUrl: req.body.fotoUrl || null,
    areasDerivadas: analysis.areasDerivadas,
    esDerivacionMultiple: analysis.esDerivacionMultiple,
  };

  // Sincronizar con el Feed en vivo (Memoria)
  const { whatsappFeeds } = require('../data/mock-data');
  if (whatsappFeeds[nuevoReporte.grupo]) {
    whatsappFeeds[nuevoReporte.grupo].unshift({
      id: nuevoReporte.id,
      time: 'Ahora',
      fecha: nuevoReporte.fecha,
      sender: nuevoReporte.reportadoPor,
      body: nuevoReporte.mensaje,
      tags: [nuevoReporte.prioridad, 'WEB'],
      color: nuevoReporte.prioridad === 'Alta' ? '#f87171' : '#fbbf24',
      category: nuevoReporte.categoria,
      lat: nuevoReporte.lat,
      lng: nuevoReporte.lng,
      ubicacion: nuevoReporte.ubicacion || nuevoReporte.direccionExtraida || null,
      fotoUrl: nuevoReporte.fotoUrl,
      sentiment: 'neutral'
    });
    // Limitar tamaño
    if (whatsappFeeds[nuevoReporte.grupo].length > 50) {
      whatsappFeeds[nuevoReporte.grupo].pop();
    }
  }

  console.log(`📱 Webhook: ${id} → ${analysis.areaPrincipal} | ${analysis.categoria}`);
  res.status(201).json({ message: 'Reporte recibido y clasificado', reporte: nuevoReporte });
});

// ===== MANTENIMIENTO Y EXPORTACIÓN =====

// GET /api/whatsapp/export/:year/:month — Exportar a CSV
router.get('/export/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const Model = getModel();

  if (!Model) {
    return res.status(500).json({ error: 'Base de datos no disponible' });
  }

  try {
    const { Op } = require('sequelize');
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const reportes = await Model.findAll({
      where: {
        fecha: { [Op.between]: [start, end] }
      },
      order: [['fecha', 'ASC']]
    });

    if (reportes.length === 0) {
      return res.status(404).json({ error: 'No hay reportes para este periodo' });
    }

    // Generar CSV manualmente
    const headers = ['ID', 'Fecha', 'Gerencia', 'Categoria', 'Mensaje', 'Prioridad', 'Estado', 'Sector', 'Ubicacion', 'ReportadoPor', 'Telefono'];
    let csv = headers.join(',') + '\n';

    reportes.forEach(r => {
      const row = [
        r.idString,
        r.fecha.toISOString(),
        r.grupo,
        r.categoria,
        `"${(r.mensaje || '').replace(/"/g, '""')}"`,
        r.prioridad,
        r.estado,
        r.sector,
        `"${(r.ubicacion || '').replace(/"/g, '""')}"`,
        `"${(r.reportadoPor || '').replace(/"/g, '""')}"`,
        r.telefono
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_SGTI_${year}_${month}.csv`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/whatsapp/purge/:year/:month — Eliminar registros antiguos
router.delete('/purge/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const Model = getModel();

  if (!Model) {
    return res.status(500).json({ error: 'Base de datos no disponible' });
  }

  try {
    const { Op } = require('sequelize');
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const deleted = await Model.destroy({
      where: {
        fecha: { [Op.between]: [start, end] }
      }
    });

    res.json({ message: `Se han eliminado ${deleted} registros del periodo ${month}/${year}.`, deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/whatsapp/webhook — Verificación webhook de Meta
router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'sgti-verify-token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ===== HELPERS =====

function formatReporteFromDB(msg) {
  return {
    id: msg.idString,
    fecha: msg.fecha,
    grupo: msg.grupo,
    grupoWhatsapp: msg.grupoWhatsapp,
    reportadoPor: msg.reportadoPor,
    telefono: msg.telefono,
    mensaje: msg.mensaje,
    categoria: msg.categoria,
    prioridad: msg.prioridad,
    sector: msg.sector,
    ubicacion: msg.ubicacion,
    direccionExtraida: msg.direccionExtraida,
    lat: msg.lat ? parseFloat(msg.lat) : null,
    lng: msg.lng ? parseFloat(msg.lng) : null,
    estado: msg.estado,
    asignadoA: msg.asignadoA,
    notas: msg.notas,
    fotoUrl: msg.fotoUrl,
    areasDerivadas: msg.areasDerivadas ? JSON.parse(msg.areasDerivadas) : [msg.grupo],
    esDerivacionMultiple: msg.esDerivacionMultiple || false,
  };
}

function getTimeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD}d`;
}

// DELETE /api/whatsapp/cleanup-demo — Limpieza selectiva de datos falsos
router.delete('/cleanup-demo', async (req, res) => {
  try {
    const { MensajeWhatsapp, Incidencia, Licencia, Inspeccion, Obra } = require('../database/models');
    const { Op } = require('sequelize');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Borrar ABSOLUTAMENTE TODOS los reportes de WhatsApp
    const deletedWsp = await MensajeWhatsapp.destroy({
      where: {} // Sin condiciones = borrar todo
    });

    // 2. Limpiar tablas demo
    await Incidencia.destroy({ where: {} });
    await Licencia.destroy({ where: {} });
    await Inspeccion.destroy({ where: {} });
    await Obra.destroy({ where: {} });


    res.json({ message: `Limpieza TOTAL exitosa. Se eliminaron ${deletedWsp} reportes y se resetearon las tablas de gestión.` });
  } catch (err) {
    res.status(500).json({ error: 'Error durante la limpieza: ' + err.message });
  }
});

module.exports = router;

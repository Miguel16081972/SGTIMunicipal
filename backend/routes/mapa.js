// ===== SGTI Municipal — Mapa API Routes =====
const express = require('express');
const { mapaLayers, whatsappReportes } = require('../data/mock-data');
const router = express.Router();

// Helper: obtener modelo BD
function getModel() {
  try { return require('../database/models').MensajeWhatsapp; } catch (e) { return null; }
}
function isDbConnected() {
  try { return require('../database/db').isConnected(); } catch (e) { return false; }
}

// GET /api/mapa/layers — Capas estáticas del mapa (Limpio de datos falsos)
router.get('/layers', (req, res) => {
  const cleanLayers = {};
  for (const key in mapaLayers) {
    cleanLayers[key] = { ...mapaLayers[key], points: [] };
  }
  res.json(cleanLayers);
});

// GET /api/mapa/reportes — Reportes geocodificados para el mapa
router.get('/reportes', async (req, res) => {
  const Model = getModel();

  // Colores por estado y prioridad
  const estadoColors = { nuevo: '#f87171', en_proceso: '#fbbf24', atendido: '#34d399' };
  const prioridadRadius = { Alta: 10, Media: 7, Baja: 5 };

  // Intentar leer de BD
  if (Model && isDbConnected()) {
    try {
      const whereOpts = { lat: { [require('sequelize').Op.not]: null } };
      
      // Filtro RBAC
      if (req.user && req.user.gerencia !== 'all') {
        const uGerencia = req.user.gerencia;
        const { Op } = require('sequelize');
        whereOpts[Op.or] = [
          { grupo: uGerencia },
          { areasDerivadas: { [Op.like]: `%"${uGerencia}"%` } }
        ];
      }

      const mensajes = await Model.findAll({
        where: whereOpts,
        order: [['fecha', 'DESC']],
        limit: 1000,
      });

      const points = mensajes.map(m => {
        const areas = m.areasDerivadas ? JSON.parse(m.areasDerivadas) : [m.grupo];
        return {
          lat: parseFloat(m.lat),
          lng: parseFloat(m.lng),
          popup: `<b>${m.idString} ${getEstadoIcon(m.estado)}</b><br>${(m.mensaje || '').substring(0, 50)}...<br><small>${m.categoria} | ${m.ubicacion || ''}</small>${areas.length > 1 ? `<br><em>Derivado a: ${areas.join(', ')}</em>` : ''}`,
          color: estadoColors[m.estado] || '#f87171',
          radius: prioridadRadius[m.prioridad] || 7,
          id: m.idString,
          estado: m.estado,
          prioridad: m.prioridad,
          grupo: m.grupo,
          areasDerivadas: areas,
        };
      });

      return res.json({ points, total: points.length, source: 'database' });
    } catch (err) {
      console.error('Error leyendo reportes para mapa:', err.message);
    }
  }

  // Fallback: usar SOLO memoria del bot activo (sin datos falsos)
  const { getMemoryReportes } = require('../bot/whatsapp-bot');
  let allReportes = [...getMemoryReportes()];
  
  if (req.user && req.user.gerencia !== 'all') {
    const uGerencia = req.user.gerencia;
    allReportes = allReportes.filter(r => {
      if (r.grupo === uGerencia) return true;
      if (r.areasDerivadas && r.areasDerivadas.includes(uGerencia)) return true;
      return false;
    });
  }

  const points = allReportes
    .filter(r => r.lat && r.lng)
    .map(r => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
      popup: `<b>${r.id} ${getEstadoIcon(r.estado)}</b><br>${r.mensaje.substring(0, 50)}...<br><small>${r.categoria} | ${r.ubicacion || ''}</small>`,
      color: estadoColors[r.estado] || '#f87171',
      radius: prioridadRadius[r.prioridad] || 7,
      id: r.id,
      estado: r.estado,
      prioridad: r.prioridad,
      grupo: r.grupo,
      areasDerivadas: r.areasDerivadas || [r.grupo],
    }));

  res.json({ points, total: points.length, source: 'memory' });
});

function getEstadoIcon(estado) {
  const icons = { nuevo: '🔴', en_proceso: '🟡', atendido: '🟢' };
  return icons[estado] || '🔴';
}

module.exports = router;

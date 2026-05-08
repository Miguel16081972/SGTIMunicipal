const express = require('express');
const { overviewKPIs, semaforo, alertas, gerencias, notificaciones } = require('../data/mock-data');
const router = express.Router();

// GET /api/overview
router.get('/', (req, res) => {
  res.json({ kpis: overviewKPIs, semaforo, alertas, gerencias });
});

// GET /api/overview/notificaciones
router.get('/notificaciones', (req, res) => {
  res.json({ notificaciones, count: notificaciones.filter(n => !n.leida).length });
});

module.exports = router;

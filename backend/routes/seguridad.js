const express = require('express');
const { seguridadSerenazgo, seguridadFiscalizacion } = require('../data/mock-data');
const router = express.Router();

// GET /api/seguridad/serenazgo
router.get('/serenazgo', (req, res) => {
  res.json(seguridadSerenazgo);
});

// GET /api/seguridad/fiscalizacion
router.get('/fiscalizacion', (req, res) => {
  res.json(seguridadFiscalizacion);
});

module.exports = router;

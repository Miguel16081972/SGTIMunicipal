const express = require('express');
const { rentasRecaudacion, rentasFiscTributaria, rentasDesarrolloEco } = require('../data/mock-data');
const router = express.Router();

// GET /api/rentas/recaudacion
router.get('/recaudacion', (req, res) => {
  res.json(rentasRecaudacion);
});

// GET /api/rentas/fisc-tributaria
router.get('/fisc-tributaria', (req, res) => {
  res.json(rentasFiscTributaria);
});

// GET /api/rentas/desarrollo-eco
router.get('/desarrollo-eco', (req, res) => {
  res.json(rentasDesarrolloEco);
});

module.exports = router;

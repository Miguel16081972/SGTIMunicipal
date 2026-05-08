const express = require('express');
const { humano } = require('../data/mock-data');
const router = express.Router();

// GET /api/humano
router.get('/', (req, res) => {
  res.json(humano);
});

// GET /api/humano/participacion
router.get('/participacion', (req, res) => {
  res.json(humano.participacion);
});

// GET /api/humano/salud
router.get('/salud', (req, res) => {
  res.json(humano.salud);
});

// GET /api/humano/educacion
router.get('/educacion', (req, res) => {
  res.json(humano.educacion);
});

module.exports = router;

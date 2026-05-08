const express = require('express');
const { riesgo } = require('../data/mock-data');
const router = express.Router();

// GET /api/riesgo
router.get('/', (req, res) => {
  res.json(riesgo);
});

module.exports = router;

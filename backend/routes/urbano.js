const express = require('express');
const { urbano } = require('../data/mock-data');
const router = express.Router();

// GET /api/urbano
router.get('/', (req, res) => {
  res.json(urbano);
});

module.exports = router;

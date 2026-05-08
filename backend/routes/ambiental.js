const express = require('express');
const { ambiental } = require('../data/mock-data');
const router = express.Router();

// GET /api/ambiental
router.get('/', (req, res) => {
  res.json(ambiental);
});

module.exports = router;

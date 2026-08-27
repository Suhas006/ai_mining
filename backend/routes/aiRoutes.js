const express = require('express');
const router = express.Router();
const { analyzeRasterWithLocalAI } = require('../controllers/aiController');

// This is the endpoint your React frontend will talk to
router.post('/analyze-raster', analyzeRasterWithLocalAI);

module.exports = router;
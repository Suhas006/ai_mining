const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');

// Configure multer to hold the image in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// When React POSTs to this route, multer grabs the file, then the controller forwards it
router.post('/analyze-raster', upload.single('file'), aiController.analyzeRaster);

module.exports = router;
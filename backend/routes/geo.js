const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/calculate-z-axis', authMiddleware, geoController.calculateZAxis);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.put('/profile/:id', authMiddleware, userController.updateProfile);

module.exports = router;

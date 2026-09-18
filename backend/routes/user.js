const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.put('/profile/:id', userController.updateProfile);

module.exports = router;

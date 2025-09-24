const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot', authController.forgotPassword);
router.post('/reset', authController.resetPassword);

// Rotas protegidas
router.post('/refresh', authenticateToken, authController.refresh);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;

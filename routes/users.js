const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de usuários
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', authController.deleteUser);

// Rota para listar usuários (apenas admin)
router.get('/', userController.getUsers);

module.exports = router;

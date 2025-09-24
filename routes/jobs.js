const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas as rotas requerem autenticação e permissão de admin
router.use(authenticateToken);
router.use(requireRole(['Admin']));

// Executar cancelamento automático de pedidos
router.get('/run-pending-cancellations', jobController.runPendingCancellations);

module.exports = router;

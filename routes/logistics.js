const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rotas públicas
router.get('/shipping/calculate', logisticsController.calculateShipping);

// Rotas protegidas
router.get('/orders/:id', authenticateToken, logisticsController.getOrderLogistics);
router.patch('/orders/:id', 
  authenticateToken, 
  requireRole(['Admin']), 
  logisticsController.updateLogisticsStatus
);

// Rotas para admin/vendedor
router.get('/orders', 
  authenticateToken, 
  requireRole(['Vendedor', 'Admin']), 
  logisticsController.getAllOrdersForLogistics
);

module.exports = router;

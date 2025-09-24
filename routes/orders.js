const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rotas de pedidos
router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.patch('/:id/status', 
  authenticateToken, 
  requireRole(['Vendedor', 'Admin']), 
  orderController.updateOrderStatus
);
router.post('/:id/cancel', authenticateToken, orderController.cancelOrder);
router.post('/:id/return', authenticateToken, orderController.requestReturn);
router.get('/returns/list', authenticateToken, orderController.getReturns);

// Rotas de pagamento (removidas - funcionalidade simplificada)

module.exports = router;

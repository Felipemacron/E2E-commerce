const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rotas públicas
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Rotas protegidas - apenas operador/admin
router.post('/:id/stock-add', 
  authenticateToken, 
  requireRole(['Vendedor', 'Admin']), 
  productController.addStock
);

// Histórico de auditoria - apenas admin
router.get('/:id/stock-audit', 
  authenticateToken, 
  requireRole(['Admin']), 
  productController.getStockAudit
);

module.exports = router;

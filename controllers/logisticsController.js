const db = require('../db/database');

class LogisticsController {
  // Buscar histórico de logística de um pedido
  async getOrderLogistics(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      // Verificar se pedido existe
      const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) {
        return res.status(404).json({
          error: true,
          code: 'ORDER_NOT_FOUND',
          message: 'Pedido não encontrado'
        });
      }

      // Verificar permissão
      if (order.user_id !== user.id && user.role !== 'Admin' && user.role !== 'Vendedor') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      // Buscar histórico de logística
      const logisticsHistory = await db.all(`
        SELECT 
          lh.id,
          lh.status,
          lh.note,
          lh.created_at
        FROM logistics_history lh
        WHERE lh.order_id = ?
        ORDER BY lh.created_at ASC
      `, [id]);

      // Buscar informações do pedido
      const orderInfo = await db.get(`
        SELECT 
          o.id,
          o.status,
          o.total,
          o.shipping_cost,
          o.created_at,
          u.name as user_name,
          a.cep,
          a.street,
          a.number,
          a.complement
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON o.user_id = a.user_id
        WHERE o.id = ?
        LIMIT 1
      `, [id]);

      res.json({
        error: false,
        data: {
          order: orderInfo,
          logisticsHistory
        }
      });

    } catch (error) {
      console.error('Erro ao buscar logística:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar status de logística (admin)
  async updateLogisticsStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const { user } = req;

      // Validar status
      const validStatuses = ['Aguardando Pagamento', 'Pago', 'Em Transporte', 'Entregue'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_STATUS',
          message: 'Status inválido'
        });
      }

      // Verificar se pedido existe
      const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) {
        return res.status(404).json({
          error: true,
          code: 'ORDER_NOT_FOUND',
          message: 'Pedido não encontrado'
        });
      }

      // Verificar transições válidas
      const validTransitions = {
        'Aguardando Pagamento': ['Pago', 'Cancelado'],
        'Pago': ['Em Transporte', 'Cancelado'],
        'Em Transporte': ['Entregue'],
        'Entregue': [],
        'Cancelado': []
      };

      if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_TRANSITION',
          message: `Não é possível alterar de '${order.status}' para '${status}'`
        });
      }

      // Iniciar transação
      await db.run('BEGIN TRANSACTION');

      try {
        // Atualizar status do pedido
        await db.run(
          'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, id]
        );

        // Registrar no histórico
        await db.run(`
          INSERT INTO logistics_history (order_id, status, note)
          VALUES (?, ?, ?)
        `, [id, status, note || `Status atualizado por ${user.name}`]);

        await db.run('COMMIT');

        res.json({
          error: false,
          message: 'Status de logística atualizado com sucesso',
          data: {
            orderId: id,
            previousStatus: order.status,
            newStatus: status,
            note: note || `Status atualizado por ${user.name}`,
            updatedBy: user.name
          }
        });

      } catch (transactionError) {
        await db.run('ROLLBACK');
        throw transactionError;
      }

    } catch (error) {
      console.error('Erro ao atualizar logística:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Calcular frete
  async calculateShipping(req, res) {
    try {
      const { total } = req.query;

      if (!total || isNaN(total)) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_TOTAL',
          message: 'Total do pedido é obrigatório'
        });
      }

      const orderTotal = parseFloat(total);
      const shippingCost = orderTotal >= 399 ? 0 : 100;

      res.json({
        error: false,
        data: {
          orderTotal,
          shippingCost,
          freeShippingThreshold: 399,
          isFreeShipping: orderTotal >= 399
        }
      });

    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar todos os pedidos para logística (admin/vendedor)
  async getAllOrdersForLogistics(req, res) {
    try {
      const { user } = req;
      const { page = 1, limit = 20, status } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = '';
      let params = [];

      // Filtro por status
      if (status) {
        whereClause = 'WHERE o.status = ?';
        params.push(status);
      }

      // Buscar pedidos
      const orders = await db.all(`
        SELECT 
          o.id,
          o.user_id,
          o.total,
          o.shipping_cost,
          o.status,
          o.financial_status,
          o.created_at,
          o.updated_at,
          u.name as user_name,
          u.email as user_email,
          a.cep,
          a.street,
          a.number,
          a.complement
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON o.user_id = a.user_id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      // Contar total
      const totalResult = await db.get(`
        SELECT COUNT(*) as total FROM orders o ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        error: false,
        data: {
          orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar pedidos para logística:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new LogisticsController();

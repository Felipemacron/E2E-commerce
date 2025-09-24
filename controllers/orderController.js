const db = require('../db/database');

class OrderController {
  // Criar novo pedido
  async createOrder(req, res) {
    try {
      const { user } = req;
      const { items, addressId, paymentMethod } = req.body;

      // Validações
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_ITEMS',
          message: 'Itens do pedido são obrigatórios'
        });
      }

      if (!addressId) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_ADDRESS',
          message: 'Endereço é obrigatório'
        });
      }

      if (!paymentMethod) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_PAYMENT',
          message: 'Método de pagamento é obrigatório'
        });
      }

      // Verificar se endereço pertence ao usuário
      const address = await db.get(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, user.id]
      );

      if (!address) {
        return res.status(404).json({
          error: true,
          code: 'ADDRESS_NOT_FOUND',
          message: 'Endereço não encontrado'
        });
      }

      // Iniciar transação
      await db.run('BEGIN TRANSACTION');

      try {
        let total = 0;
        const orderItems = [];

        // Validar produtos e calcular total
        for (const item of items) {
          const product = await db.get(
            'SELECT id, name, price, stock, is_active FROM products WHERE id = ?',
            [item.productId]
          );

          if (!product) {
            throw new Error(`Produto ${item.productId} não encontrado`);
          }

          if (!product.is_active) {
            throw new Error(`Produto ${product.name} está inativo`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`);
          }

          const itemTotal = product.price * item.quantity;
          total += itemTotal;

          orderItems.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            total: itemTotal
          });
        }

        // Calcular frete
        const shippingCost = total >= 399 ? 0 : 100;
        const finalTotal = total + shippingCost;

        // Criar pedido
        const orderResult = await db.run(`
          INSERT INTO orders (user_id, total, shipping_cost, status, financial_status)
          VALUES (?, ?, ?, 'Aguardando Pagamento', 'Pendente')
        `, [user.id, finalTotal, shippingCost]);

        const orderId = orderResult.id;

        // Criar itens do pedido e atualizar estoque
        for (const item of orderItems) {
          await db.run(`
            INSERT INTO order_items (order_id, product_id, qty, unit_price)
            VALUES (?, ?, ?, ?)
          `, [orderId, item.productId, item.quantity, item.unitPrice]);

          // Atualizar estoque
          await db.run(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }

        // Registrar histórico de logística
        await db.run(`
          INSERT INTO logistics_history (order_id, status, note)
          VALUES (?, 'Aguardando Pagamento', 'Pedido criado')
        `, [orderId]);

        await db.run('COMMIT');

        // Buscar pedido criado
        const newOrder = await db.get(`
          SELECT o.*, a.cep, a.street, a.number, a.complement
          FROM orders o
          JOIN addresses a ON o.user_id = a.user_id
          WHERE o.id = ? AND a.id = ?
        `, [orderId, addressId]);

        res.status(201).json({
          error: false,
          message: 'Pedido criado com sucesso',
          data: {
            order: newOrder,
            items: orderItems,
            summary: {
              subtotal: total,
              shipping: shippingCost,
              total: finalTotal
            }
          }
        });

      } catch (transactionError) {
        await db.run('ROLLBACK');
        throw transactionError;
      }

    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  // Buscar pedido por ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      // Buscar pedido
      const order = await db.get(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `, [id]);

      if (!order) {
        return res.status(404).json({
          error: true,
          code: 'ORDER_NOT_FOUND',
          message: 'Pedido não encontrado'
        });
      }

      // Verificar permissão (próprio pedido ou admin)
      if (order.user_id !== user.id && user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      // Buscar itens do pedido
      const items = await db.all(`
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);

      // Buscar endereço
      const address = await db.get(`
        SELECT a.*
        FROM addresses a
        JOIN orders o ON a.user_id = o.user_id
        WHERE o.id = ?
        LIMIT 1
      `, [id]);

      res.json({
        error: false,
        data: {
          order,
          items,
          address
        }
      });

    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar pedidos
  async getOrders(req, res) {
    try {
      const { user } = req;
      const { page = 1, limit = 10, status } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = '';
      let params = [];

      // Filtro por usuário (clientes veem apenas seus pedidos)
      if (user.role === 'Cliente') {
        whereClause = 'WHERE o.user_id = ?';
        params.push(user.id);
      }

      // Filtro por status
      if (status) {
        whereClause += whereClause ? ' AND o.status = ?' : 'WHERE o.status = ?';
        params.push(status);
      }

      // Buscar pedidos
      const orders = await db.all(`
        SELECT o.*, u.name as user_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
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
      console.error('Erro ao buscar pedidos:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar status do pedido
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
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

      // Buscar pedido
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

      // Atualizar status
      await db.run(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );

      // Registrar histórico
      await db.run(`
        INSERT INTO logistics_history (order_id, status, note)
        VALUES (?, ?, ?)
      `, [id, status, `Status alterado por ${user.name}`]);

      res.json({
        error: false,
        message: 'Status atualizado com sucesso',
        data: {
          orderId: id,
          previousStatus: order.status,
          newStatus: status
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Cancelar pedido
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const { user } = req;

      if (!reason) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_REASON',
          message: 'Motivo do cancelamento é obrigatório'
        });
      }

      // Buscar pedido
      const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) {
        return res.status(404).json({
          error: true,
          code: 'ORDER_NOT_FOUND',
          message: 'Pedido não encontrado'
        });
      }

      // Verificar se pode cancelar
      const cancellableStatuses = ['Aguardando Pagamento', 'Pago'];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).json({
          error: true,
          code: 'CANNOT_CANCEL',
          message: `Pedido não pode ser cancelado no status '${order.status}'`
        });
      }

      // Verificar permissão (próprio pedido ou admin)
      if (order.user_id !== user.id && user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      // Iniciar transação
      await db.run('BEGIN TRANSACTION');

      try {
        // Atualizar status
        await db.run(
          'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['Cancelado', id]
        );

        // Registrar cancelamento
        await db.run(`
          INSERT INTO order_cancellations (order_id, reason)
          VALUES (?, ?)
        `, [id, reason]);

        // Restaurar estoque
        const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [id]);
        for (const item of items) {
          await db.run(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.qty, item.product_id]
          );
        }

        // Registrar histórico
        await db.run(`
          INSERT INTO logistics_history (order_id, status, note)
          VALUES (?, 'Cancelado', ?)
        `, [id, `Cancelado: ${reason}`]);

        await db.run('COMMIT');

        res.json({
          error: false,
          message: 'Pedido cancelado com sucesso',
          data: {
            orderId: id,
            reason,
            cancelledBy: user.name
          }
        });

      } catch (transactionError) {
        await db.run('ROLLBACK');
        throw transactionError;
      }

    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Solicitar devolução
  async requestReturn(req, res) {
    try {
      const { id } = req.params;
      const { items, reason, returnType } = req.body;
      const { user } = req;

      if (!items || !reason || !returnType) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_FIELDS',
          message: 'Itens, motivo e tipo de devolução são obrigatórios'
        });
      }

      if (!['defect', 'no_defect'].includes(returnType)) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_RETURN_TYPE',
          message: 'Tipo de devolução deve ser "defect" ou "no_defect"'
        });
      }

      // Buscar pedido
      const order = await db.get(`
        SELECT o.*, lh.created_at as delivered_at
        FROM orders o
        LEFT JOIN logistics_history lh ON o.id = lh.order_id AND lh.status = 'Entregue'
        WHERE o.id = ? AND o.status = 'Entregue'
      `, [id]);

      if (!order) {
        return res.status(404).json({
          error: true,
          code: 'ORDER_NOT_FOUND',
          message: 'Pedido não encontrado ou não entregue'
        });
      }

      // Verificar permissão (próprio pedido ou admin)
      if (order.user_id !== user.id && user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      // Verificar prazo de devolução
      const deliveredAt = new Date(order.delivered_at);
      const now = new Date();
      const daysSinceDelivery = Math.floor((now - deliveredAt) / (1000 * 60 * 60 * 24));

      let maxDays;
      if (returnType === 'defect') {
        maxDays = 30; // 30 dias para produtos com defeito
      } else {
        maxDays = 7; // 7 dias para produtos sem defeito
      }

      if (daysSinceDelivery > maxDays) {
        return res.status(400).json({
          error: true,
          code: 'RETURN_PERIOD_EXPIRED',
          message: `Prazo de devolução expirado. Máximo ${maxDays} dias para ${returnType === 'defect' ? 'produtos com defeito' : 'produtos sem defeito'}`
        });
      }

      // Verificar se já existe devolução para este pedido
      const existingReturn = await db.get(
        'SELECT id FROM order_returns WHERE order_id = ?',
        [id]
      );

      if (existingReturn) {
        return res.status(400).json({
          error: true,
          code: 'RETURN_ALREADY_EXISTS',
          message: 'Já existe uma solicitação de devolução para este pedido'
        });
      }

      // Criar solicitação de devolução
      const result = await db.run(`
        INSERT INTO order_returns (order_id, items, reason, return_type)
        VALUES (?, ?, ?, ?)
      `, [id, JSON.stringify(items), reason, returnType]);

      res.json({
        error: false,
        message: 'Solicitação de devolução criada com sucesso',
        data: {
          returnId: result.id,
          orderId: id,
          returnType,
          daysSinceDelivery,
          maxDays
        }
      });

    } catch (error) {
      console.error('Erro ao solicitar devolução:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar devoluções (admin)
  async getReturns(req, res) {
    try {
      const { user } = req;
      const { page = 1, limit = 10, status } = req.query;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      const offset = (page - 1) * limit;
      let whereClause = '';
      let params = [];

      if (status) {
        whereClause = 'WHERE or.status = ?';
        params.push(status);
      }

      // Buscar devoluções
      const returns = await db.all(`
        SELECT or.*, o.user_id, u.name as user_name, u.email as user_email
        FROM order_returns or
        JOIN orders o ON or.order_id = o.id
        JOIN users u ON o.user_id = u.id
        ${whereClause}
        ORDER BY or.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      // Contar total
      const totalResult = await db.get(`
        SELECT COUNT(*) as total FROM order_returns or ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        error: false,
        data: {
          returns,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar devoluções:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new OrderController();

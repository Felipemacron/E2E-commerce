const db = require('../db/database');

class JobController {
  // Executar cancelamento automático de pedidos não pagos
  async runPendingCancellations(req, res) {
    try {
      const { user } = req;

      // Apenas admin pode executar manualmente
      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      // Buscar pedidos em "Aguardando Pagamento" há mais de 72 horas
      const expiredOrders = await db.all(`
        SELECT id, user_id, created_at
        FROM orders 
        WHERE status = 'Aguardando Pagamento' 
        AND created_at < datetime('now', '-72 hours')
      `);

      let cancelledCount = 0;
      const cancelledOrders = [];

      for (const order of expiredOrders) {
        try {
          // Iniciar transação
          await db.run('BEGIN TRANSACTION');

          // Atualizar status para cancelado
          await db.run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['Cancelado', order.id]
          );

          // Registrar cancelamento
          await db.run(`
            INSERT INTO order_cancellations (order_id, reason)
            VALUES (?, ?)
          `, [order.id, 'Pagamento não confirmado em 72h']);

          // Restaurar estoque
          const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
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
          `, [order.id, 'Cancelado automaticamente: Pagamento não confirmado em 72h']);

          await db.run('COMMIT');

          cancelledCount++;
          cancelledOrders.push({
            orderId: order.id,
            userId: order.user_id,
            createdAt: order.created_at
          });

        } catch (transactionError) {
          await db.run('ROLLBACK');
          console.error(`Erro ao cancelar pedido ${order.id}:`, transactionError);
        }
      }

      res.json({
        error: false,
        message: `Job executado com sucesso. ${cancelledCount} pedidos cancelados.`,
        data: {
          cancelledCount,
          cancelledOrders,
          executedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao executar job de cancelamento:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Executar job automaticamente (chamado pelo cron)
  async executePendingCancellations() {
    try {
      console.log('Executando job de cancelamento automático...');

      // Buscar pedidos em "Aguardando Pagamento" há mais de 72 horas
      const expiredOrders = await db.all(`
        SELECT id, user_id, created_at
        FROM orders 
        WHERE status = 'Aguardando Pagamento' 
        AND created_at < datetime('now', '-72 hours')
      `);

      let cancelledCount = 0;

      for (const order of expiredOrders) {
        try {
          // Iniciar transação
          await db.run('BEGIN TRANSACTION');

          // Atualizar status para cancelado
          await db.run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['Cancelado', order.id]
          );

          // Registrar cancelamento
          await db.run(`
            INSERT INTO order_cancellations (order_id, reason)
            VALUES (?, ?)
          `, [order.id, 'Pagamento não confirmado em 72h']);

          // Restaurar estoque
          const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
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
          `, [order.id, 'Cancelado automaticamente: Pagamento não confirmado em 72h']);

          await db.run('COMMIT');

          cancelledCount++;
          console.log(`Pedido ${order.id} cancelado automaticamente`);

        } catch (transactionError) {
          await db.run('ROLLBACK');
          console.error(`Erro ao cancelar pedido ${order.id}:`, transactionError);
        }
      }

      if (cancelledCount > 0) {
        console.log(`Job executado: ${cancelledCount} pedidos cancelados automaticamente`);
      }

      return cancelledCount;

    } catch (error) {
      console.error('Erro ao executar job automático:', error);
      return 0;
    }
  }

  // Limpar tokens de redefinição expirados
  async cleanupExpiredTokens() {
    try {
      const result = await db.run(`
        DELETE FROM password_reset_tokens 
        WHERE expires_at < datetime('now') OR used = 1
      `);

      if (result.changes > 0) {
        console.log(`${result.changes} tokens de redefinição expirados removidos`);
      }

      return result.changes;

    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
      return 0;
    }
  }
}

module.exports = new JobController();

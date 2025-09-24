const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/products - Lista produtos paginado
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Buscar produtos
    const products = await db.all(`
      SELECT 
        id,
        name as title,
        LOWER(REPLACE(name, ' ', '-')) as slug,
        category,
        'Marca Demo' as brand,
        description,
        price,
        stock as quantity,
        image_url,
        'SKU-' || id as sku,
        'RJ' as warehouse,
        4.5 as rating_average,
        25 as rating_count,
        created_at,
        updated_at
      FROM products 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    // Contar total
    const totalResult = await db.get('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
    const total = totalResult.total;

    // Formatar produtos
    const formattedProducts = products.map(product => ({
      id: `PROD-${String(product.id).padStart(4, '0')}`,
      title: product.title,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url,
      price: {
        currency: 'BRL',
        original: product.price,
        discount_percent: 0,
        final: product.price
      },
      stock: {
        quantity: product.quantity,
        sku: product.sku,
        warehouse: product.warehouse
      },
      rating: {
        average: product.rating_average,
        count: product.rating_count
      },
      created_at: product.created_at,
      updated_at: product.updated_at
    }));

    res.json({
      meta: {
        total,
        page,
        pageSize
      },
      products: formattedProducts
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/orders - Criar pedido e baixar estoque
router.post('/orders', async (req, res) => {
  try {
    const { buyer, items } = req.body;

    // Validar dados
    if (!buyer || !buyer.name || !buyer.email) {
      return res.status(400).json({
        error: true,
        message: 'Dados do comprador são obrigatórios'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Itens do pedido são obrigatórios'
      });
    }

    // Iniciar transação
    await db.run('BEGIN TRANSACTION');

    try {
      // Buscar ou criar usuário para catálogo simples
      let user = await db.get('SELECT id FROM users WHERE email = ?', [buyer.email]);
      
      if (!user) {
        await db.run(`
          INSERT INTO users (name, email, password_hash, role, created_at)
          VALUES (?, ?, 'catalog_user', 'Cliente', datetime('now'))
        `, [buyer.name, buyer.email]);
        
        // Buscar o usuário criado
        user = await db.get('SELECT id FROM users WHERE email = ?', [buyer.email]);
      }
      
      if (!user || !user.id) {
        throw new Error('Erro ao criar/buscar usuário');
      }
      
      // Criar pedido
      await db.run(`
        INSERT INTO orders (user_id, status, total, created_at)
        VALUES (?, 'Aguardando Pagamento', 0, datetime('now'))
      `, [user.id]);

      // Buscar o pedido criado
      const order = await db.get('SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id]);
      const orderId = order.id;
      let total = 0;
      const orderItems = [];

      // Processar cada item
      for (const item of items) {
        const productId = item.productId.replace('PROD-', '');
        
        // Buscar produto
        const product = await db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId]);
        
        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }

        if (product.stock < item.qty) {
          throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`);
        }

        // Calcular subtotal
        const subtotal = product.price * item.qty;
        total += subtotal;

        // Adicionar item ao pedido
        await db.run(`
          INSERT INTO order_items (order_id, product_id, qty, unit_price)
          VALUES (?, ?, ?, ?)
        `, [orderId, productId, item.qty, product.price]);

        // Baixar estoque
        await db.run(`
          UPDATE products SET stock = stock - ? WHERE id = ?
        `, [item.qty, productId]);

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          qty: item.qty,
          unitPrice: product.price,
          subtotal
        });
      }

      // Atualizar total do pedido
      await db.run('UPDATE orders SET total = ? WHERE id = ?', [total, orderId]);

      // Confirmar transação
      await db.run('COMMIT');

      res.status(201).json({
        error: false,
        message: 'Pedido criado com sucesso',
        order: {
          id: orderId,
          buyer: {
            name: buyer.name,
            email: buyer.email
          },
          items: orderItems,
          total,
          status: 'Aguardando Pagamento',
          created_at: new Date().toISOString()
        }
      });

    } catch (error) {
      // Reverter transação
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(400).json({
      error: true,
      message: error.message || 'Erro ao criar pedido'
    });
  }
});

module.exports = router;

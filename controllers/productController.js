const db = require('../db/database');

class ProductController {
  // Listar produtos com filtros e paginação
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        q = '',
        category = '',
        sort = 'name'
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = 'WHERE is_active = 1';
      let params = [];

      // Filtro por busca
      if (q) {
        whereClause += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${q}%`, `%${q}%`);
      }

      // Filtro por categoria
      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      // Ordenação
      const validSorts = ['name', 'price', 'created_at'];
      const sortField = validSorts.includes(sort) ? sort : 'name';
      const orderBy = `ORDER BY ${sortField} ASC`;

      // Buscar produtos
      const products = await db.all(`
        SELECT id, name, description, category, price, stock, image_url, created_at
        FROM products 
        ${whereClause}
        ${orderBy}
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      // Contar total
      const totalResult = await db.get(`
        SELECT COUNT(*) as total FROM products ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        error: false,
        data: {
          products,
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
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar produto por ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await db.get(`
        SELECT id, name, description, category, price, stock, image_url, is_active, max_stock, created_at
        FROM products 
        WHERE id = ? AND is_active = 1
      `, [id]);

      if (!product) {
        return res.status(404).json({
          error: true,
          code: 'PRODUCT_NOT_FOUND',
          message: 'Produto não encontrado'
        });
      }

      res.json({
        error: false,
        data: product
      });

    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Adicionar estoque (apenas operador/admin)
  async addStock(req, res) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const { user } = req;

      // Validações
      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_AMOUNT',
          message: 'Quantidade deve ser maior que zero'
        });
      }

      // Verificar se é múltiplo de 10
      if (amount % 10 !== 0) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_STOCK',
          message: 'Acréscimo deve ser em lotes de 10 (10, 20, 30…)'
        });
      }

      // Buscar produto
      const product = await db.get(`
        SELECT id, name, stock, is_active, max_stock
        FROM products 
        WHERE id = ?
      `, [id]);

      if (!product) {
        return res.status(404).json({
          error: true,
          code: 'PRODUCT_NOT_FOUND',
          message: 'Produto não encontrado'
        });
      }

      if (!product.is_active) {
        return res.status(400).json({
          error: true,
          code: 'PRODUCT_INACTIVE',
          message: 'Produto inativo: não é possível ajustar estoque'
        });
      }

      // Verificar limite máximo
      const newStock = product.stock + amount;
      if (product.max_stock && newStock > product.max_stock) {
        return res.status(400).json({
          error: true,
          code: 'STOCK_LIMIT_EXCEEDED',
          message: `Operação ultrapassa o limite de estoque (máx. ${product.max_stock}).`
        });
      }

      // Iniciar transação
      await db.run('BEGIN TRANSACTION');

      try {
        // Atualizar estoque
        await db.run(
          'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newStock, id]
        );

        // Registrar auditoria
        await db.run(`
          INSERT INTO stock_audit (product_id, previous_stock, added_amount, new_stock, user_id)
          VALUES (?, ?, ?, ?, ?)
        `, [id, product.stock, amount, newStock, user.id]);

        await db.run('COMMIT');

        // Buscar produto atualizado
        const updatedProduct = await db.get(`
          SELECT id, name, stock, max_stock
          FROM products 
          WHERE id = ?
        `, [id]);

        res.json({
          error: false,
          message: 'Estoque adicionado com sucesso',
          data: {
            product: updatedProduct,
            audit: {
              previousStock: product.stock,
              addedAmount: amount,
              newStock: newStock,
              addedBy: user.name
            }
          }
        });

      } catch (transactionError) {
        await db.run('ROLLBACK');
        throw transactionError;
      }

    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar categorias
  async getCategories(req, res) {
    try {
      const categories = await db.all(`
        SELECT DISTINCT category 
        FROM products 
        WHERE is_active = 1 
        ORDER BY category
      `);

      res.json({
        error: false,
        data: categories.map(c => c.category)
      });

    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Histórico de auditoria de estoque
  async getStockAudit(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      // Verificar se produto existe
      const product = await db.get('SELECT id, name FROM products WHERE id = ?', [id]);
      if (!product) {
        return res.status(404).json({
          error: true,
          code: 'PRODUCT_NOT_FOUND',
          message: 'Produto não encontrado'
        });
      }

      // Buscar histórico
      const auditHistory = await db.all(`
        SELECT 
          sa.id,
          sa.previous_stock,
          sa.added_amount,
          sa.new_stock,
          sa.created_at,
          u.name as user_name
        FROM stock_audit sa
        JOIN users u ON sa.user_id = u.id
        WHERE sa.product_id = ?
        ORDER BY sa.created_at DESC
        LIMIT ? OFFSET ?
      `, [id, parseInt(limit), offset]);

      // Contar total
      const totalResult = await db.get(`
        SELECT COUNT(*) as total FROM stock_audit WHERE product_id = ?
      `, [id]);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        error: false,
        data: {
          product: {
            id: product.id,
            name: product.name
          },
          auditHistory,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar histórico de estoque:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new ProductController();

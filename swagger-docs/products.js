/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar produtos com filtros e paginação
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: Itens por página
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Termo de busca (nome do produto)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, price, created_at]
 *           default: name
 *         description: Campo para ordenação
 *     responses:
 *       200:
 *         description: Lista de produtos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *             examples:
 *               sucesso:
 *                 summary: Lista de produtos
 *                 value:
 *                   error: false
 *                   data:
 *                     products:
 *                       - id: 1
 *                         name: "Smartphone XYZ"
 *                         description: "Smartphone com tela de 6.5 polegadas"
 *                         price: 1299.99
 *                         category: "Eletrônicos"
 *                         stock: 50
 *                         is_active: true
 *                     pagination:
 *                       page: 1
 *                       limit: 12
 *                       totalPages: 3
 *                       totalItems: 25
 *                       hasNext: true
 *                       hasPrev: false
 */

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Listar todas as categorias de produtos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de categorias obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               error: false
 *               data: ["Eletrônicos", "Roupas", "Casa e Jardim", "Livros"]
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obter detalhes de um produto específico
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *         example: 1
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "PRODUCT_NOT_FOUND"
 *               message: "Produto não encontrado"
 */

/**
 * @swagger
 * /products/{id}/stock-add:
 *   post:
 *     summary: Adicionar estoque a um produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockUpdate'
 *           examples:
 *             adicionar_20:
 *               summary: Adicionar 20 unidades
 *               value:
 *                 amount: 20
 *             adicionar_50:
 *               summary: Adicionar 50 unidades
 *               value:
 *                 amount: 50
 *     responses:
 *       200:
 *         description: Estoque adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Estoque adicionado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                     audit:
 *                       type: object
 *                       properties:
 *                         addedAmount:
 *                           type: integer
 *                           example: 20
 *                         addedBy:
 *                           type: string
 *                           example: "João Vendedor"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               quantidade_invalida:
 *                 summary: Quantidade não é múltiplo de 10
 *                 value:
 *                   error: true
 *                   code: "INVALID_STOCK"
 *                   message: "Acréscimo deve ser em lotes de 10 (10, 20, 30…)"
 *               produto_inativo:
 *                 summary: Produto inativo
 *                 value:
 *                   error: true
 *                   code: "PRODUCT_INACTIVE"
 *                   message: "Não é possível adicionar estoque a produto inativo"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INSUFFICIENT_PERMISSIONS"
 *               message: "Acesso negado. Apenas vendedores e admins podem adicionar estoque"
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /products/{id}/stock-audit:
 *   get:
 *     summary: Obter histórico de auditoria de estoque de um produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *         example: 1
 *     responses:
 *       200:
 *         description: Histórico de auditoria obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                     auditHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           amount:
 *                             type: integer
 *                             description: Quantidade adicionada
 *                           previousStock:
 *                             type: integer
 *                             description: Estoque anterior
 *                           newStock:
 *                             type: integer
 *                             description: Novo estoque
 *                           addedBy:
 *                             type: string
 *                             description: Nome do usuário que adicionou
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INSUFFICIENT_PERMISSIONS"
 *               message: "Acesso negado. Apenas admins podem visualizar auditoria"
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

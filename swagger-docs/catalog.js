/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista produtos paginado
 *     tags: [Catalog]
 *     description: |
 *       Endpoint principal para listar produtos do catálogo com paginação.
 *       Segue o mesmo padrão do catalogo-products do GitHub.
 *       
 *       **Funcionalidades:**
 *       - Paginação automática
 *       - Filtros por categoria
 *       - Busca por nome
 *       - Formato padronizado de resposta
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *         example: "eletrônicos"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome do produto
 *         example: "smartphone"
 *     responses:
 *       200:
 *         description: Lista de produtos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de produtos
 *                       example: 500
 *                     page:
 *                       type: integer
 *                       description: Página atual
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: Itens por página
 *                       example: 10
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CatalogProduct'
 *             examples:
 *               sucesso:
 *                 summary: Lista de produtos
 *                 value:
 *                   meta:
 *                     total: 500
 *                     page: 1
 *                     pageSize: 10
 *                   products:
 *                     - id: "PROD-0001"
 *                       title: "Produto 1"
 *                       slug: "produto-1"
 *                       category: "eletrônicos"
 *                       brand: "Marca Demo"
 *                       description: "Descrição detalhada do produto 1"
 *                       price:
 *                         currency: "BRL"
 *                         original: 299.99
 *                         discount_percent: 0
 *                         final: 299.99
 *                       stock:
 *                         quantity: 50
 *                         sku: "SKU-1"
 *                         warehouse: "RJ"
 *                       rating:
 *                         average: 4.5
 *                         count: 25
 *                       created_at: "2024-01-15T10:30:00Z"
 *                       updated_at: "2024-01-15T10:30:00Z"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               message: "Erro interno do servidor"
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Criar pedido e baixar estoque
 *     tags: [Catalog]
 *     description: |
 *       Endpoint para criar pedidos e automaticamente baixar o estoque dos produtos.
 *       Segue o mesmo padrão do catalogo-products do GitHub.
 *       
 *       **Funcionalidades:**
 *       - Criação de pedido sem autenticação
 *       - Baixa automática de estoque
 *       - Validação de estoque disponível
 *       - Transação atômica (tudo ou nada)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [buyer, items]
 *             properties:
 *               buyer:
 *                 type: object
 *                 required: [name, email]
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Nome do comprador
 *                     example: "João Silva"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email do comprador
 *                     example: "joao@example.com"
 *               items:
 *                 type: array
 *                 description: Lista de itens do pedido
 *                 items:
 *                   type: object
 *                   required: [productId, qty]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ID do produto (formato PROD-XXXX)
 *                       example: "PROD-0001"
 *                     qty:
 *                       type: integer
 *                       minimum: 1
 *                       description: Quantidade do produto
 *                       example: 2
 *           examples:
 *             pedido_simples:
 *               summary: Pedido com um produto
 *               value:
 *                 buyer:
 *                   name: "João Silva"
 *                   email: "joao@example.com"
 *                 items:
 *                   - productId: "PROD-0001"
 *                     qty: 1
 *             pedido_multiplos:
 *               summary: Pedido com múltiplos produtos
 *               value:
 *                 buyer:
 *                   name: "Maria Santos"
 *                   email: "maria@example.com"
 *                 items:
 *                   - productId: "PROD-0001"
 *                     qty: 2
 *                   - productId: "PROD-0002"
 *                     qty: 1
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
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
 *                   example: "Pedido criado com sucesso"
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID do pedido
 *                       example: 1
 *                     buyer:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "João Silva"
 *                         email:
 *                           type: string
 *                           example: "joao@example.com"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             example: "PROD-0001"
 *                           productName:
 *                             type: string
 *                             example: "Produto 1"
 *                           qty:
 *                             type: integer
 *                             example: 1
 *                           unitPrice:
 *                             type: number
 *                             example: 299.99
 *                           subtotal:
 *                             type: number
 *                             example: 299.99
 *                     total:
 *                       type: number
 *                       description: Valor total do pedido
 *                       example: 299.99
 *                     status:
 *                       type: string
 *                       example: "Aguardando Pagamento"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *             examples:
 *               sucesso:
 *                 summary: Pedido criado com sucesso
 *                 value:
 *                   error: false
 *                   message: "Pedido criado com sucesso"
 *                   order:
 *                     id: 1
 *                     buyer:
 *                       name: "João Silva"
 *                       email: "joao@example.com"
 *                     items:
 *                       - productId: "PROD-0001"
 *                         productName: "Produto 1"
 *                         qty: 1
 *                         unitPrice: 299.99
 *                         subtotal: 299.99
 *                     total: 299.99
 *                     status: "Aguardando Pagamento"
 *                     created_at: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Dados inválidos ou erro na criação do pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               dados_invalidos:
 *                 summary: Dados do comprador inválidos
 *                 value:
 *                   error: true
 *                   message: "Dados do comprador são obrigatórios"
 *               produto_inexistente:
 *                 summary: Produto não encontrado
 *                 value:
 *                   error: true
 *                   message: "Produto PROD-9999 não encontrado"
 *               estoque_insuficiente:
 *                 summary: Estoque insuficiente
 *                 value:
 *                   error: true
 *                   message: "Estoque insuficiente para Produto 1. Disponível: 5"
 */

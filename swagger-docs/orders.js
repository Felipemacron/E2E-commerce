/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Criar novo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shipping_address]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, qty]
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       description: ID do produto
 *                       example: 1
 *                     qty:
 *                       type: integer
 *                       minimum: 1
 *                       description: Quantidade do produto
 *                       example: 2
 *               shipping_address:
 *                 type: object
 *                 required: [type, cep, street, number]
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Residencial, Comercial]
 *                     example: "Residencial"
 *                   cep:
 *                     type: string
 *                     example: "01234-567"
 *                   street:
 *                     type: string
 *                     example: "Rua das Flores"
 *                   number:
 *                     type: string
 *                     example: "123"
 *                   complement:
 *                     type: string
 *                     example: "Apto 45"
 *           examples:
 *             pedido_simples:
 *               summary: Pedido com um produto
 *               value:
 *                 items:
 *                   - product_id: 1
 *                     qty: 1
 *                 shipping_address:
 *                   type: "Residencial"
 *                   cep: "01234-567"
 *                   street: "Rua das Flores"
 *                   number: "123"
 *             pedido_multiplos:
 *               summary: Pedido com múltiplos produtos
 *               value:
 *                 items:
 *                   - product_id: 1
 *                     qty: 2
 *                   - product_id: 3
 *                     qty: 1
 *                 shipping_address:
 *                   type: "Comercial"
 *                   cep: "04567-890"
 *                   street: "Av. Paulista"
 *                   number: "1000"
 *                   complement: "Sala 501"
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
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               produto_inexistente:
 *                 summary: Produto não encontrado
 *                 value:
 *                   error: true
 *                   code: "PRODUCT_NOT_FOUND"
 *                   message: "Produto não encontrado"
 *               estoque_insuficiente:
 *                 summary: Estoque insuficiente
 *                 value:
 *                   error: true
 *                   code: "INSUFFICIENT_STOCK"
 *                   message: "Estoque insuficiente para o produto"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Listar pedidos do usuário logado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Aguardando Pagamento, Pago, Em Transporte, Entregue, Cancelado]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de pedidos obtida com sucesso
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obter detalhes de um pedido específico
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *         example: 1
 *     responses:
 *       200:
 *         description: Pedido encontrado
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderItem'
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "ORDER_NOT_FOUND"
 *               message: "Pedido não encontrado"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "ACCESS_DENIED"
 *               message: "Você só pode visualizar seus próprios pedidos"
 */

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Atualizar status de um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderStatusUpdate'
 *           examples:
 *             marcar_pago:
 *               summary: Marcar como pago
 *               value:
 *                 status: "Pago"
 *             enviar:
 *               summary: Marcar como em transporte
 *               value:
 *                 status: "Em Transporte"
 *             entregar:
 *               summary: Marcar como entregue
 *               value:
 *                 status: "Entregue"
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
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
 *                   example: "Status do pedido atualizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                       example: 1
 *                     oldStatus:
 *                       type: string
 *                       example: "Aguardando Pagamento"
 *                     newStatus:
 *                       type: string
 *                       example: "Pago"
 *       400:
 *         description: Transição de status inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INVALID_STATUS_TRANSITION"
 *               message: "Não é possível alterar de 'Entregue' para 'Pago'"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INSUFFICIENT_PERMISSIONS"
 *               message: "Apenas vendedores e admins podem atualizar status"
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancelar um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrderRequest'
 *           examples:
 *             cancelamento_cliente:
 *               summary: Cancelamento por cliente
 *               value:
 *                 reason: "Produto não atendeu às expectativas"
 *             cancelamento_estoque:
 *               summary: Cancelamento por falta de estoque
 *               value:
 *                 reason: "Produto indisponível no momento"
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
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
 *                   example: "Pedido cancelado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                       example: 1
 *                     newStatus:
 *                       type: string
 *                       example: "Cancelado"
 *                     reason:
 *                       type: string
 *                       example: "Produto não atendeu às expectativas"
 *       400:
 *         description: Pedido não pode ser cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "CANNOT_CANCEL"
 *               message: "Pedido não pode ser cancelado no status atual"
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /orders/{id}/return:
 *   post:
 *     summary: Solicitar devolução de um pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, reason]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [defective, no_defect]
 *                 description: Tipo de devolução
 *                 example: "no_defect"
 *               reason:
 *                 type: string
 *                 description: Motivo da devolução
 *                 example: "Produto não atendeu às expectativas"
 *           examples:
 *             sem_defeito:
 *               summary: Devolução sem defeito (7 dias)
 *               value:
 *                 type: "no_defect"
 *                 reason: "Produto não atendeu às expectativas"
 *             com_defeito:
 *               summary: Devolução com defeito (30 dias)
 *               value:
 *                 type: "defective"
 *                 reason: "Produto chegou com defeito na tela"
 *     responses:
 *       201:
 *         description: Solicitação de devolução criada com sucesso
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
 *                   example: "Solicitação de devolução criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     returnId:
 *                       type: integer
 *                       example: 1
 *                     orderId:
 *                       type: integer
 *                       example: 1
 *                     type:
 *                       type: string
 *                       example: "no_defect"
 *                     deadline:
 *                       type: string
 *                       format: date-time
 *                       description: Prazo para devolução
 *       400:
 *         description: Pedido não pode ser devolvido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               status_invalido:
 *                 summary: Status inválido para devolução
 *                 value:
 *                   error: true
 *                   code: "INVALID_STATUS"
 *                   message: "Pedido deve estar 'Entregue' para solicitar devolução"
 *               prazo_expirado:
 *                 summary: Prazo de devolução expirado
 *                 value:
 *                   error: true
 *                   code: "RETURN_DEADLINE_EXPIRED"
 *                   message: "Prazo para devolução expirou"
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /orders/returns/list:
 *   get:
 *     summary: Listar devoluções (apenas para admins)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de devoluções obtida com sucesso
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       orderId:
 *                         type: integer
 *                       user_name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       status:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INSUFFICIENT_PERMISSIONS"
 *               message: "Apenas admins podem visualizar devoluções"
 */

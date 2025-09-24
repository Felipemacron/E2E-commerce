/**
 * @swagger
 * /logistics/shipping/calculate:
 *   get:
 *     summary: Calcular custo de frete
 *     tags: [Logistics]
 *     parameters:
 *       - in: query
 *         name: total
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Valor total do pedido
 *         example: 299.99
 *     responses:
 *       200:
 *         description: Cálculo de frete realizado com sucesso
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
 *                     orderTotal:
 *                       type: number
 *                       format: float
 *                       description: Valor total do pedido
 *                       example: 299.99
 *                     shippingCost:
 *                       type: number
 *                       format: float
 *                       description: Custo do frete
 *                       example: 100.00
 *                     freeShipping:
 *                       type: boolean
 *                       description: Se o frete é grátis
 *                       example: false
 *                     finalTotal:
 *                       type: number
 *                       format: float
 *                       description: Valor final (pedido + frete)
 *                       example: 399.99
 *             examples:
 *               frete_pago:
 *                 summary: Pedido com frete pago
 *                 value:
 *                   error: false
 *                   data:
 *                     orderTotal: 299.99
 *                     shippingCost: 100.00
 *                     freeShipping: false
 *                     finalTotal: 399.99
 *               frete_gratis:
 *                 summary: Pedido com frete grátis
 *                 value:
 *                   error: false
 *                   data:
 *                     orderTotal: 450.00
 *                     shippingCost: 0.00
 *                     freeShipping: true
 *                     finalTotal: 450.00
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INVALID_PARAMETERS"
 *               message: "Valor total é obrigatório"
 */

/**
 * @swagger
 * /logistics/orders/{id}:
 *   get:
 *     summary: Obter histórico de logística de um pedido
 *     tags: [Logistics]
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
 *         description: Histórico de logística obtido com sucesso
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
 *                     orderId:
 *                       type: integer
 *                       example: 1
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID do evento
 *                           status:
 *                             type: string
 *                             description: Status do pedido
 *                             example: "Aguardando Pagamento"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             description: Data e hora do evento
 *                           description:
 *                             type: string
 *                             description: Descrição do evento
 *                             example: "Pedido criado e aguardando pagamento"
 *                     currentStatus:
 *                       type: string
 *                       description: Status atual do pedido
 *                       example: "Em Transporte"
 *             example:
 *               error: false
 *               data:
 *                 orderId: 1
 *                 currentStatus: "Em Transporte"
 *                 history:
 *                   - id: 1
 *                     status: "Aguardando Pagamento"
 *                     timestamp: "2024-01-15T10:30:00Z"
 *                     description: "Pedido criado e aguardando pagamento"
 *                   - id: 2
 *                     status: "Pago"
 *                     timestamp: "2024-01-15T11:45:00Z"
 *                     description: "Pagamento confirmado"
 *                   - id: 3
 *                     status: "Em Transporte"
 *                     timestamp: "2024-01-16T08:20:00Z"
 *                     description: "Pedido enviado para transporte"
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

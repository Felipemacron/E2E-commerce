/**
 * @swagger
 * /jobs/run-pending-cancellations:
 *   get:
 *     summary: Executar job de cancelamento de pedidos não pagos
 *     tags: [Jobs]
 *     description: |
 *       Job automático que cancela pedidos com status "Aguardando Pagamento" 
 *       que foram criados há mais de 72 horas.
 *       
 *       **Execução automática:** A cada 1 hora
 *       
 *       **Critérios de cancelamento:**
 *       - Status: "Aguardando Pagamento"
 *       - Tempo: Criado há mais de 72 horas
 *       - Restaura estoque automaticamente
 *     responses:
 *       200:
 *         description: Job executado com sucesso
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
 *                   example: "Job de cancelamento executado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cancelledOrders:
 *                       type: integer
 *                       description: Número de pedidos cancelados
 *                       example: 3
 *                     restoredStock:
 *                       type: integer
 *                       description: Total de itens restaurados no estoque
 *                       example: 15
 *                     executionTime:
 *                       type: string
 *                       format: date-time
 *                       description: Horário de execução
 *             examples:
 *               sucesso_com_cancelamentos:
 *                 summary: Job executado com cancelamentos
 *                 value:
 *                   error: false
 *                   message: "Job de cancelamento executado com sucesso"
 *                   data:
 *                     cancelledOrders: 3
 *                     restoredStock: 15
 *                     executionTime: "2024-01-15T14:30:00Z"
 *               sucesso_sem_cancelamentos:
 *                 summary: Job executado sem cancelamentos
 *                 value:
 *                   error: false
 *                   message: "Job de cancelamento executado com sucesso"
 *                   data:
 *                     cancelledOrders: 0
 *                     restoredStock: 0
 *                     executionTime: "2024-01-15T14:30:00Z"
 */

/**
 * @swagger
 * /jobs/cleanup-expired-tokens:
 *   get:
 *     summary: Executar limpeza de tokens de redefinição expirados
 *     tags: [Jobs]
 *     description: |
 *       Job automático que remove tokens de redefinição de senha que expiraram.
 *       
 *       **Execução automática:** A cada 6 horas
 *       
 *       **Critérios de limpeza:**
 *       - Tokens expirados (mais de 1 hora)
 *       - Tokens já utilizados
 *       - Tokens inválidos
 *     responses:
 *       200:
 *         description: Job executado com sucesso
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
 *                   example: "Job de limpeza de tokens executado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     removedTokens:
 *                       type: integer
 *                       description: Número de tokens removidos
 *                       example: 12
 *                     executionTime:
 *                       type: string
 *                       format: date-time
 *                       description: Horário de execução
 *             examples:
 *               sucesso_com_limpeza:
 *                 summary: Job executado com limpeza
 *                 value:
 *                   error: false
 *                   message: "Job de limpeza de tokens executado com sucesso"
 *                   data:
 *                     removedTokens: 12
 *                     executionTime: "2024-01-15T14:30:00Z"
 *               sucesso_sem_limpeza:
 *                 summary: Job executado sem limpeza
 *                 value:
 *                   error: false
 *                   message: "Job de limpeza de tokens executado com sucesso"
 *                   data:
 *                     removedTokens: 0
 *                     executionTime: "2024-01-15T14:30:00Z"
 */

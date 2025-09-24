/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check da API
 *     tags: [System]
 *     description: |
 *       Endpoint para verificar se a API está funcionando corretamente.
 *       Útil para monitoramento e verificação de status do sistema.
 *     responses:
 *       200:
 *         description: API funcionando corretamente
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
 *                   example: "E2E-Commerce API está funcionando"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp da verificação
 *                   example: "2024-01-15T14:30:00.000Z"
 *                 version:
 *                   type: string
 *                   description: Versão da API
 *                   example: "1.0.0"
 *             example:
 *               error: false
 *               message: "E2E-Commerce API está funcionando"
 *               timestamp: "2024-01-15T14:30:00.000Z"
 *               version: "1.0.0"
 */

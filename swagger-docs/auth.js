/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             cliente:
 *               summary: Registro de cliente
 *               value:
 *                 name: "João Silva"
 *                 email: "joao@example.com"
 *                 password: "MinhaSenh@123"
 *                 role: "Cliente"
 *             vendedor:
 *               summary: Registro de vendedor
 *               value:
 *                 name: "Maria Vendedora"
 *                 email: "maria@example.com"
 *                 password: "Vendedor123!@#"
 *                 role: "Vendedor"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
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
 *                   example: "Usuário registrado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: Token JWT para autenticação
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               email_existente:
 *                 summary: Email já cadastrado
 *                 value:
 *                   error: true
 *                   code: "EMAIL_EXISTS"
 *                   message: "Email já está cadastrado"
 *               senha_fraca:
 *                 summary: Senha não atende critérios
 *                 value:
 *                   error: true
 *                   code: "WEAK_PASSWORD"
 *                   message: "Senha deve ter pelo menos 10 caracteres com letras, números e símbolos"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login no sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             cliente:
 *               summary: Login de cliente
 *               value:
 *                 email: "cliente@e2ecommerce.com"
 *                 password: "Cliente123!@#"
 *             admin:
 *               summary: Login de admin
 *               value:
 *                 email: "admin@e2ecommerce.com"
 *                 password: "Admin123!@#"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
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
 *                   example: "Login realizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: Token JWT (expira em 30 minutos)
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INVALID_CREDENTIALS"
 *               message: "Email ou senha incorretos"
 */

/**
 * @swagger
 * /auth/forgot:
 *   post:
 *     summary: Solicitar redefinição de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "cliente@e2ecommerce.com"
 *     responses:
 *       200:
 *         description: Email de redefinição enviado
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
 *                   example: "Email de redefinição enviado com sucesso"
 *       404:
 *         description: Email não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "USER_NOT_FOUND"
 *               message: "Usuário não encontrado"
 */

/**
 * @swagger
 * /auth/reset:
 *   post:
 *     summary: Redefinir senha com token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de redefinição recebido por email
 *                 example: "abc123def456"
 *               newPassword:
 *                 type: string
 *                 description: Nova senha (mínimo 10 caracteres com letras, números e símbolos)
 *                 example: "NovaSenh@123"
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: false
 *               message: "Senha redefinida com sucesso"
 *       400:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INVALID_TOKEN"
 *               message: "Token inválido ou expirado"
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obter perfil do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "UNAUTHORIZED"
 *               message: "Token inválido ou expirado"
 */

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Atualizar perfil do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva Santos"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.santos@example.com"
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
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
 *                   example: "Perfil atualizado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
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
 *                   example: "Token renovado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Novo token JWT
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

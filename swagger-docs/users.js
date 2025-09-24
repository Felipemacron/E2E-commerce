/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obter dados de um usuário específico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado
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
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "USER_NOT_FOUND"
 *               message: "Usuário não encontrado"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "ACCESS_DENIED"
 *               message: "Você só pode visualizar seus próprios dados"
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualizar dados de um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Silva Santos"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "joao.santos@example.com"
 *               role:
 *                 type: string
 *                 enum: [Cliente, Vendedor, Admin]
 *                 description: Papel do usuário no sistema
 *                 example: "Cliente"
 *           examples:
 *             atualizar_nome:
 *               summary: Atualizar apenas o nome
 *               value:
 *                 name: "João Silva Santos"
 *             atualizar_email:
 *               summary: Atualizar apenas o email
 *               value:
 *                 email: "joao.santos@example.com"
 *             atualizar_role:
 *               summary: Atualizar role (apenas admins)
 *               value:
 *                 role: "Vendedor"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
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
 *                   example: "Usuário atualizado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *               role_invalida:
 *                 summary: Role inválida
 *                 value:
 *                   error: true
 *                   code: "INVALID_ROLE"
 *                   message: "Role deve ser Cliente, Vendedor ou Admin"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "ACCESS_DENIED"
 *               message: "Você só pode atualizar seus próprios dados"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deletar um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [confirm]
 *             properties:
 *               confirm:
 *                 type: boolean
 *                 description: Confirmação de exclusão
 *                 example: true
 *           example:
 *             confirm: true
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
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
 *                   example: "Usuário deletado com sucesso"
 *       400:
 *         description: Confirmação necessária
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "CONFIRMATION_REQUIRED"
 *               message: "Confirmação de exclusão é obrigatória"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               acesso_negado:
 *                 summary: Acesso negado
 *                 value:
 *                   error: true
 *                   code: "ACCESS_DENIED"
 *                   message: "Apenas admins podem deletar usuários"
 *               ultimo_admin:
 *                 summary: Último admin
 *                 value:
 *                   error: true
 *                   code: "LAST_ADMIN"
 *                   message: "Não é possível deletar o último admin do sistema"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários (apenas para admins)
 *     tags: [Users]
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
 *           default: 20
 *         description: Itens por página
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Cliente, Vendedor, Admin]
 *         description: Filtrar por role
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               error: true
 *               code: "INSUFFICIENT_PERMISSIONS"
 *               message: "Apenas admins podem listar usuários"
 */

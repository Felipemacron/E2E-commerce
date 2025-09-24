const db = require('../db/database');

class UserController {
  // Buscar usuário por ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;

      // Verificar se é o próprio usuário ou admin
      if (user.id !== parseInt(id) && user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      const targetUser = await db.get(`
        SELECT id, name, email, role, is_active, created_at, updated_at
        FROM users 
        WHERE id = ?
      `, [id]);

      if (!targetUser) {
        return res.status(404).json({
          error: true,
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        error: false,
        data: targetUser
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar usuário
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      const { user } = req;

      // Verificar se é o próprio usuário ou admin
      if (user.id !== parseInt(id) && user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      if (!name) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_NAME',
          message: 'Nome é obrigatório'
        });
      }

      // Verificar se email já existe (se estiver sendo alterado)
      if (email) {
        const existingUser = await db.get(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, id]
        );
        if (existingUser) {
          return res.status(409).json({
            error: true,
            code: 'EMAIL_EXISTS',
            message: 'Email já cadastrado'
          });
        }
      }

      // Atualizar usuário
      const updateFields = [];
      const updateValues = [];

      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }

      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await db.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Buscar usuário atualizado
      const updatedUser = await db.get(`
        SELECT id, name, email, role, is_active, created_at, updated_at
        FROM users 
        WHERE id = ?
      `, [id]);

      res.json({
        error: false,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar usuários (apenas admin)
  async getUsers(req, res) {
    try {
      const { user } = req;
      const { page = 1, limit = 10, role } = req.query;

      if (user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      const offset = (page - 1) * limit;
      let whereClause = '';
      let params = [];

      if (role) {
        whereClause = 'WHERE role = ?';
        params.push(role);
      }

      // Buscar usuários
      const users = await db.all(`
        SELECT id, name, email, role, is_active, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);

      // Contar total
      const totalResult = await db.get(`
        SELECT COUNT(*) as total FROM users ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        error: false,
        data: {
          users,
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
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new UserController();

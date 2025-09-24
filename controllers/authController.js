const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db/database');
const { generateToken, validatePassword } = require('../middleware/auth');

class AuthController {
  // Registrar novo usuário
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validações básicas
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_FIELDS',
          message: 'Todos os campos são obrigatórios'
        });
      }

      // Validar role
      if (!['Cliente', 'Vendedor', 'Admin'].includes(role)) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_ROLE',
          message: 'Role deve ser: Cliente, Vendedor ou Admin'
        });
      }

      // Validar senha
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: true,
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        });
      }

      // Verificar se email já existe
      const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(409).json({
          error: true,
          code: 'EMAIL_EXISTS',
          message: 'Email já cadastrado'
        });
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Criar usuário
      const result = await db.run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, role]
      );

      // Buscar usuário criado
      const newUser = await db.get(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [result.id]
      );

      // Gerar token
      const token = generateToken(newUser.id);

      res.status(201).json({
        error: false,
        message: 'Usuário criado com sucesso',
        data: {
          user: newUser,
          token
        }
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_CREDENTIALS',
          message: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const user = await db.get(
        'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        return res.status(401).json({
          error: true,
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          error: true,
          code: 'USER_INACTIVE',
          message: 'Usuário inativo'
        });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({
          error: true,
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos'
        });
      }

      // Gerar token
      const token = generateToken(user.id);

      // Atualizar último acesso
      await db.run(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      res.json({
        error: false,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Refresh token
  async refresh(req, res) {
    try {
      const { user } = req;

      // Verificar se usuário ainda está ativo
      const currentUser = await db.get(
        'SELECT id, name, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
        [user.id]
      );

      if (!currentUser) {
        return res.status(401).json({
          error: true,
          code: 'USER_INACTIVE',
          message: 'Usuário inativo'
        });
      }

      // Gerar novo token
      const token = generateToken(user.id);

      res.json({
        error: false,
        message: 'Token renovado com sucesso',
        data: {
          user: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
          },
          token
        }
      });

    } catch (error) {
      console.error('Erro no refresh:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Perfil do usuário
  async getProfile(req, res) {
    try {
      const { user } = req;

      res.json({
        error: false,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar perfil
  async updateProfile(req, res) {
    try {
      const { user } = req;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_NAME',
          message: 'Nome é obrigatório'
        });
      }

      await db.run(
        'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, user.id]
      );

      const updatedUser = await db.get(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [user.id]
      );

      res.json({
        error: false,
        message: 'Perfil atualizado com sucesso',
        data: updatedUser
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Solicitar redefinição de senha
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_EMAIL',
          message: 'Email é obrigatório'
        });
      }

      // Verificar se usuário existe
      const user = await db.get('SELECT id, email FROM users WHERE email = ? AND is_active = 1', [email]);
      if (!user) {
        // Por segurança, sempre retornar sucesso mesmo se email não existir
        return res.json({
          error: false,
          message: 'Se o email existir, você receberá instruções para redefinir sua senha'
        });
      }

      // Gerar token único
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Invalidar tokens anteriores
      await db.run(
        'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?',
        [user.id]
      );

      // Salvar novo token
      await db.run(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt.toISOString()]
      );

      // Simular envio de email (em produção, enviar email real)
      console.log(`Token de redefinição para ${email}: ${token}`);
      console.log(`Link: http://localhost:3000/reset-password?token=${token}`);

      res.json({
        error: false,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha',
        data: {
          token: token, // Apenas para testes - remover em produção
          expiresAt: expiresAt.toISOString()
        }
      });

    } catch (error) {
      console.error('Erro ao solicitar redefinição:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Redefinir senha
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_FIELDS',
          message: 'Token e nova senha são obrigatórios'
        });
      }

      // Validar senha
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: true,
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        });
      }

      // Buscar token válido
      const tokenData = await db.get(`
        SELECT prt.*, u.id as user_id, u.email 
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > datetime('now')
      `, [token]);

      if (!tokenData) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_TOKEN',
          message: 'Token inválido ou expirado'
        });
      }

      // Hash da nova senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Iniciar transação
      await db.run('BEGIN TRANSACTION');

      try {
        // Atualizar senha
        await db.run(
          'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [passwordHash, tokenData.user_id]
        );

        // Marcar token como usado
        await db.run(
          'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
          [tokenData.id]
        );

        // Invalidar todos os tokens JWT do usuário (em produção, usar blacklist)
        await db.run('COMMIT');

        res.json({
          error: false,
          message: 'Senha redefinida com sucesso'
        });

      } catch (transactionError) {
        await db.run('ROLLBACK');
        throw transactionError;
      }

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar usuário (admin ou próprio usuário com confirmação)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;
      const { confirmation } = req.body;

      // Verificar se é admin ou próprio usuário
      if (user.id !== parseInt(id) && user.role !== 'Admin') {
        return res.status(403).json({
          error: true,
          code: 'ACCESS_DENIED',
          message: 'Acesso negado'
        });
      }

      // Verificar confirmação
      if (!confirmation || confirmation !== 'CONFIRMAR_EXCLUSAO') {
        return res.status(400).json({
          error: true,
          code: 'MISSING_CONFIRMATION',
          message: 'Confirmação obrigatória. Envie "CONFIRMAR_EXCLUSAO" no campo confirmation'
        });
      }

      // Verificar se usuário existe
      const targetUser = await db.get('SELECT id, email FROM users WHERE id = ?', [id]);
      if (!targetUser) {
        return res.status(404).json({
          error: true,
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado'
        });
      }

      // Não permitir exclusão do último admin
      if (targetUser.role === 'Admin') {
        const adminCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "Admin" AND is_active = 1');
        if (adminCount.count <= 1) {
          return res.status(400).json({
            error: true,
            code: 'CANNOT_DELETE_LAST_ADMIN',
            message: 'Não é possível excluir o último administrador'
          });
        }
      }

      // Desativar usuário em vez de excluir (soft delete)
      await db.run(
        'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      res.json({
        error: false,
        message: 'Usuário desativado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new AuthController();

const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'e2e-commerce-secret-key-2024';
const JWT_EXPIRES_IN = '30m';

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: true,
      code: 'NO_TOKEN',
      message: 'Token de acesso requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await db.get(
      'SELECT id, name, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        error: true,
        code: 'INVALID_TOKEN',
        message: 'Token inválido ou usuário inativo'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado'
      });
    }
    
    return res.status(403).json({
      error: true,
      code: 'INVALID_TOKEN',
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        code: 'NO_AUTH',
        message: 'Autenticação requerida'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Permissões insuficientes'
      });
    }

    next();
  };
};

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar senha forte
const validatePassword = (password) => {
  if (password.length < 10) {
    return {
      valid: false,
      message: 'Senha deve ter pelo menos 10 caracteres'
    };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Senha deve conter pelo menos uma letra'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Senha deve conter pelo menos um número'
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Senha deve conter pelo menos um caractere especial'
    };
  }

  return { valid: true };
};

module.exports = {
  authenticateToken,
  requireRole,
  generateToken,
  validatePassword,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
